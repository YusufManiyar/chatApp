// Imports the Google Cloud client library
const { Storage } = require('@google-cloud/storage');
const { pipeline }  = require('stream/promises')
const { Readable }  = require('stream')
// Creates a client
const storage = new Storage({
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
  }
});

// The name for the new bucket
const bucketName = 'chatmet';


// Path to the file you want to upload
module.exports = {
    uploadFile:  async (file) => {

      console.log(file, Object.getOwnPropertyNames(file), ' => file')
      const readStream = new Readable()
      readStream.push(file)
      readStream.push(null)

      const filename = `chat-attachements/${new Date().toString()}, ${file.name}`
      const gcpBucket = storage.bucket(bucketName)
      const writeToBucketStream = gcpBucket.file(filename).createWriteStream({
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      })

      const data = await pipeline([readStream, writeToBucketStream])

      const [url] = await gcpBucket.file(filename).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000,
      })
  
      return url

    }
}


