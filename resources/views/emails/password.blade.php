<!DOCTYPE html>
<html>
<head>
    <title>Vos identifiants de connexion</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #444;
            margin: 0;
            padding: 0;
            background-color: #f5f7fa;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3a7bd5, #00d2ff);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px;
        }
        .credentials {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 25px 0;
            border-left: 4px solid #3a7bd5;
        }
        .credentials p {
            margin: 10px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3a7bd5;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999;
            background-color: #f5f7fa;
        }
        .signature {
            margin-top: 30px;
            color: #666;
        }
        .social {
            margin: 20px 0;
        }
        .social a {
            margin: 0 10px;
            color: #3a7bd5;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">[Votre Logo]</div>
            <h2>Bienvenue sur notre plateforme</h2>
        </div>
        
        <div class="content">
            <p>Bonjour {{ $prenom }} {{ $nom }},</p>
            
            <p>Nous sommes ravis de vous compter parmi nos utilisateurs. Votre compte a été créé avec succès et vous pouvez dès maintenant accéder à tous nos services.</p>
            
            <div class="credentials">
                <p><strong>Email :</strong> {{ $email }}</p>
                <p><strong>Mot de passe temporaire :</strong> {{ $password }}</p>
            </div>
            
            <p>Pour votre sécurité, nous vous recommandons de :</p>
            <ul>
                <li>Changer votre mot de passe dès votre première connexion</li>
                <li>Ne jamais partager vos identifiants</li>
                <li>Utiliser un mot de passe unique et complexe</li>
            </ul>
            
            <center>
                <a href="[URL_de_connexion]" class="button">Accéder à mon compte</a>
            </center>
            
            <p>Si vous rencontrez le moindre problème, n'hésitez pas à répondre à cet email ou à contacter notre support.</p>
            
            <div class="signature">
                <p>Cordialement,</p>
                <p><strong>L'équipe [Nom de votre entreprise]</strong></p>
            </div>
            
            <div class="social">
                <p>Suivez-nous sur :</p>
                <a href="#">LinkedIn</a> | 
                <a href="#">Twitter</a> | 
                <a href="#">Facebook</a>
            </div>
        </div>
        
       
    </div>
</body>
</html>