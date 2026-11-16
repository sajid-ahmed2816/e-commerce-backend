class CloudinaryStorage {
  constructor({ cloudinary, params = {} }) {
    this.cloudinary = cloudinary;
    this.params = params;
  }

  _handleFile(req, file, callback) {
    const upload = this.cloudinary.uploader.upload_stream({
      folder: this.params.folder,
      allowed_formats: this.params.allowedFormats,
      resource_type: "image",
    }, (error, result) => {
      if (error) return callback(error);
      callback(null, {
        path: result.secure_url,
        filename: result.public_id,
        public_id: result.public_id,
        size: result.bytes,
        format: result.format,
      });
    });

    file.stream.on("error", callback);
    file.stream.pipe(upload);
  }

  _removeFile(req, file, callback) {
    this.cloudinary.uploader.destroy(file.filename).then(
      () => callback(null),
      callback
    );
  }
}

module.exports = { CloudinaryStorage };
