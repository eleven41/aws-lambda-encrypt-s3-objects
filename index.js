// Load up all dependencies
var AWS = require('aws-sdk');

console.log("Version 0.1.0");

// get reference to S3 client 
var s3 = new AWS.S3();

// This is the entry-point to the Lambda function.
exports.handler = function (event, context) {
    
    // Process all records in the event.
    for (var i = 0; i < event.Records.length; ++i) {
        
        // The bucket and key are part of the event data
        var bucket = event.Records[i].s3.bucket.name;
        var key = unescape(event.Records[i].s3.object.key);
        
        console.log('Processing ' + bucket + '/' + key);

        // Get the head data to determine if the object is already encrypted.
        console.log('Getting object head');
        s3.headObject({
            Bucket: bucket,
            Key: key
        }, function (err, data) {
            if (err) {
                console.log('Error getting object head:');
                console.log(err, err.stack); // an error occurred
                context.fail('Error', "Error getting object head: " + err);
            } else if (data.ServerSideEncryption != 'AES256') {
                // Copy the object adding the encryption
                console.log('Updating object');
                s3.copyObject({
                    Bucket: bucket,
                    Key: key,
                    
                    CopySource: escape(bucket + '/' + key),
                    MetadataDirective: 'COPY',
                    ServerSideEncryption: 'AES256'
                }, function (err, data) {
                    if (err) {
                        console.log('Error updating object:');
                        console.log(err, err.stack); // an error occurred
                        context.fail('Error', "Error updating object: " + err);
                    } else {
                        console.log('Object updated.');
                        context.succeed();
                    }
                });
            } else {
                console.log("Object is already encrypted using 'AES256'.");
                context.succeed();
            }
        });
    }
};
