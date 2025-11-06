import nodemailer from 'nodemailer';

// Create a test account for development
const createTestAccount = async () => {
  if (process.env.NODE_ENV === 'production') return null;
  
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account created:', testAccount.user);
    return testAccount;
  } catch (error) {
    console.error('Error creating test account:', error);
    return null;
  }
};

// Create a transporter
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use a real email service
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // In development, use ethereal.email
    const testAccount = await createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount?.user || 'user@example.com',
        pass: testAccount?.pass || 'password',
      },
    });
  }
};

// Function to send password reset email
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  username: string
) {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"Restaurante App" <${process.env.EMAIL_FROM || 'noreply@restaurante.com'}>`,
      to,
      subject: 'Restablece tu contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Restablece tu contraseña</h2>
          <p>Hola ${username},</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 4px;">
              Restablecer Contraseña
            </a>
          </p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>El enlace expirará en 1 hora.</p>
          <p>Atentamente,<br>El equipo de Restaurante App</p>
        </div>
      `,
      text: `
        Hola ${username},

        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
        
        Por favor, visita el siguiente enlace para crear una nueva contraseña:
        ${resetUrl}
        
        Si no solicitaste este cambio, puedes ignorar este correo.
        
        El enlace expirará en 1 hora.
        
        Atentamente,
        El equipo de Restaurante App
      `,
    });

    console.log('Message sent: %s', info.messageId);
    
    // Preview only available when sending through an Ethereal account
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error al enviar el correo electrónico');
  }
}
