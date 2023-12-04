# webapp for assignments
# cloud assignments
Prerequisites:
1. Node JS
2. MySql

Running Application:
1. Clone the repository
2. Install Dependencies - npm install
3. Place the .env file which contains your database configurations
4. Run the application - node index.js


domain name : dbwebapp.me
!for demo!

# steps to import ssl certificate
- ### Importing SSL Certificate from Namecheap to AWS ACM and Load Balancer Configuration

#### Step 1: Obtain SSL Certificate from Namecheap
Purchase or obtain an SSL certificate from Namecheap. You should receive files like `your_certificate.crt`, `your_private_key.key`, and potentially `your_chain.crt`.

#### Step 2: Prepare Certificate Files
Concatenate the SSL certificate and intermediate certificates into a single file:
```bash
cat your_certificate.crt your_chain.crt > your_certificate_chain.pem

#### Step 3: Import Certificate into AWS ACM
aws acm import-certificate --certificate fileb://path/to/your_certificate_chain.pem --private-key fileb://path/to/your_private_key.key --certificate-chain fileb://path/to/your_certificate_chain.pem

#### Step 4: Configure Load Balancer
Access the AWS Management Console.
Go to Load Balancers, select your load balancer.
Edit the HTTPS listener settings.
Choose the imported certificate from ACM.
Follow these steps to import the SSL certificate from Namecheap into AWS ACM and configure your load balancer to use the imported certificate.
