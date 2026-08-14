import io
import os

import joblib
import oci


def _bucket_client():
    try:
        signer = oci.auth.signers.InstancePrincipalsSecurityTokenSigner()
        return oci.object_storage.ObjectStorageClient({}, signer=signer)
    except Exception:  # noqa: BLE001
        # Off an OCI compute instance the signer fails reaching the metadata
        # endpoint (169.254.169.254) and raises a connection error, NOT a config
        # error -- catching only ConfigFileNotFound/InvalidConfig made this
        # fallback unreachable and crashed the container instead.
        #
        # local: ~/.oci/config (API key).
        return oci.object_storage.ObjectStorageClient(oci.config.from_file())


def load_model():
    # Atajo de dev: si hay un .joblib local, no se toca OCI (ni credenciales ni red).
    local_path = os.environ.get("MODEL_LOCAL_PATH")
    if local_path and os.path.isfile(local_path):
        return joblib.load(local_path)

    client = _bucket_client()
    ns = client.get_namespace().data
    bucket = os.environ["MODEL_BUCKET"]

    prefix = client.get_object(ns, bucket, "models/latest.txt").data.content.decode().strip()
    blob   = client.get_object(ns, bucket, prefix + "model.joblib").data.content
    model  = joblib.load(io.BytesIO(blob))

    return model