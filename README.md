# aws-lambda-encrypt-s3-objects
An AWS Lambda function to encrypt S3 objects using server-side AES256 encryption 
as they are added to the bucket.

## Configuration

### IAM Role

Create an IAM role with the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1430872797000",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Sid": "Stmt1430872844000",
            "Effect": "Allow",
            "Action": [
                "cloudwatch:*"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Sid": "Stmt1430872852000",
            "Effect": "Allow",
            "Action": [
                "logs:*"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

### Lambda Function

1. Create a new Lambda function.
2. Upload the file index.js as the code for your Lambda function.
3. Add an event source to your Lambda function:
 * Event Source Type: S3
 * Bucket: your source bucket
 * Event Type: Object Created

At this point, if you upload a file to your source bucket, the file 
should be converted to AES256 encryption if it isn't already encrypted.

## Notes

Lambda will invoke this function twice for each file uploaded:

1. Once for the true upload, and
2. A second time because we've modified the file.
