import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testMail() {
    console.log('Testing Mail configuration...');
    console.log('Host:', process.env.MAIL_HOST);
    console.log('Port:', process.env.MAIL_PORT);
    console.log('User:', process.env.MAIL_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '465'),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false // Often needed for custom mail servers
        }
    });

    try {
        await transporter.verify();
        console.log('✅ Connection successful!');
        
        const info = await transporter.sendMail({
            from: `"SAT-MOVIL TEST" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_USER,
            subject: 'Test connection',
            text: 'This is a test email to verify SMTP configuration.'
        });
        
        console.log('✅ Test email sent:', info.messageId);
    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
}

testMail();
