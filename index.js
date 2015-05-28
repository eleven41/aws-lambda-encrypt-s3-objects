// Load up all dependencies
var AWS = require('aws-sdk');

console.log("Version 0.2.0");

// get reference to S3 client 
var s3 = new AWS.S3();

// This is the entry-point to the Lambda function.
exports.handler = function (event, context) {
    
    if (event.Records == null) {
        context.fail('Error', "Event has no records.");
        return;
    }
    
    // Process all records in the event.
    for (var i = 0; i < event.Records.length; ++i) {
        
        var record = event.Records[i];
        if (record.s3 == null) {
            context.fail('Error', "Event record is missing s3 structure.");
            return;
        }
        
        // The bucket and key are part of the event data
        var bucket = record.s3.bucket.name;
        var key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
        
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
                
                readConfig(bucket, function (err, config) {
                    if (err) {
                        console.log('Error reading configuration from tags:');
                        console.log(err, err.stack); // an error occurred
                        context.fail('Error', "Error reading configuration from tags: " + err);
                    } else {

                        var storageClass = 'STANDARD';
                        if (config.setReducedRedundancy)
                            storageClass = 'REDUCED_REDUNDANCY';
                        
                        // Copy the object adding the encryption
                        console.log('Updating object');
                        s3.copyObject({
                            Bucket: bucket,
                            Key: key,
                            
                            CopySource: encodeURIComponent(bucket + '/' + key),
                            MetadataDirective: 'COPY',
                            ServerSideEncryption: 'AES256',
                            StorageClass: storageClass
                        }, function (err, data) {
                            if (err) {
                                console.log('Error updating object:');
                                console.log(err, err.stack); // an error occurred
                                context.fail('Error', "Error updating object: " + err);
                            } else {
                                context.succeed(bucket + '/' + key + ' updated.');
                            }
                        });
                    }
                });
            } else {
                context.succeed(bucket + '/' + key + " is already encrypted using 'AES256'.");
            }
        });
    }
};

// readConfig
//
// Gets the tags for the named bucket, and
// from those tags, sets the configuration.
// Once found, it calls the callback function passing
// the configuration.
function readConfig(bucketName, callback) {
    console.log("Getting tags for bucket '" + bucketName + "'");
    s3.getBucketTagging({
        Bucket: bucketName
    }, function (err, data) {
        if (err) {
            callback(err, null);
        } else {
            
            // Set defaults
            var config = {
                setReducedRedundancy: false
            };
            
            var tags = data.TagSet;
            
            console.log("Processing tags...");
            for (var i = 0; i < tags.length; ++i) {
                var tag = tags[i];
                
                console.log("Processing tag: " + tag.Key);
                if (tag.Key == 'SetReducedRedundancy') {
                    console.log("Tag 'SetReducedRedundancy' found with value '" + tag.Value + "'");
                    if (tag.Value != null && tag.Value.toLowerCase() == 'yes') {
                        config.setReducedRedundancy = true;
                    }
                }
            }
            
            callback(null, config);
        }
    });
}
