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
                "s3:GetBucketTagging",
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

### Building the Lambda Package

1. Clone this repo

```
git clone git@github.com:eleven41/aws-lambda-encrypt-s3-objects.git
cd aws-lambda-encrypt-s3-objects
```

2. Install requirements

```
npm install async
npm install aws-sdk
```

3. Zip up the folder using your favourite zipping utility

### Lambda Function

1. Create a new Lambda function.
2. Upload the ZIP package for the lambda function using `index.handler` as the handler.
3. Add an event source to your Lambda function:
 * Event Source Type: S3
 * Bucket: your source bucket
 * Event Type: Object Created
4. Set your Lambda function to execute using the IAM role you created above.

At this point, if you upload a file to your source bucket, the file 
should be converted to AES256 encryption if it isn't already encrypted.

### Additional Options

Configuration is performed by setting tags on the bucket.

Tag Name | Notes
---|---
SetReducedRedundancy | Set to 'Yes' to use reduced redundancy for the object.

## Notes

Lambda will invoke this function twice for each file uploaded:

1. Once for the true upload, and
2. A second time because we've modified the file.
