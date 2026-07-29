import os

import oci

def _bucket_client():
    try:                                   
        signer = oci.auth.signers.InstancePrincipalsSecurityTokenSigner()
        return oci.object_storage.ObjectStorageClient({}, signer=signer)
    except (oci.exceptions.ConfigFileNotFound, oci.exceptions.InvalidConfig):
        return oci.object_storage.ObjectStorageClient(oci.config.from_file())

def load_model():
    file_name = "model.joblib"
    bucket_name = "techmind-data" 
    objet_path = "models/v1/model.joblib" 
    
    if not os.path.exists(file_name):
        print("Downloading model from OCI")

        client = _bucket_client()
        
        ns = client.get_namespace().data
        response = client.get_object(ns, bucket_name, objet_path)

        return response