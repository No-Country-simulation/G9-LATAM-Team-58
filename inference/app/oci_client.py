import io, os, joblib, oci


def _bucket_client():
    try:                                   
        signer = oci.auth.signers.InstancePrincipalsSecurityTokenSigner()
        return oci.object_storage.ObjectStorageClient({}, signer=signer)
    except (oci.exceptions.ConfigFileNotFound, oci.exceptions.InvalidConfig):
        return oci.object_storage.ObjectStorageClient(oci.config.from_file())
      
def load_model():
    client = _bucket_client()
    ns = client.get_namespace().data
    bucket = os.environ["MODEL_BUCKET"]                  

    prefix = client.get_object(ns, bucket, "models/latest.txt").data.content.decode().strip()
    blob   = client.get_object(ns, bucket, prefix + "model.joblib").data.content
    model  = joblib.load(io.BytesIO(blob))

    return model