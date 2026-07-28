import os

import oci

def download_oci_model():
    file_name = "model.joblib"
    bucket_name = "techmind-data" 
    objet_path = "models/v1/model.joblib" 
    
    if not os.path.exists(file_name):
        print("Downloading model from OCI")
        config = oci.config.from_file()
        client = oci.object_storage.ObjectStorageClient(config)
        ns = client.get_namespace().data
        response = client.get_object(ns, bucket_name, objet_path)
        
        with open(file_name, "wb") as f:
            for chunk in response.data.raw.stream(1024 * 1024, decode_content = False):
                f.writelines(chunk)