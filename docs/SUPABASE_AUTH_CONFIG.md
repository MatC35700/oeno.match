# Configuration Supabase Auth pour Oeno.match

## Vérification par code uniquement (token OTP)

L'inscription utilise un **code à 6-10 chiffres** envoyé par email. Pas de lien à cliquer.

---

## Template Magic Link (obligatoire)

**Authentication** → **Email** → **Magic Link**

### Subject
```
Confirmez votre inscription à Oeno.match
```

### Body (Source)
```html
<h2>Bienvenue sur Oeno.match</h2>
<p>Votre code de vérification :</p>
<p><strong>{{ .Token }}</strong></p>
<p>Entrez ce code dans l'application pour continuer.</p>
<p>— L'équipe Oeno.match</p>
```

**Important** : n'utilisez que `{{ .Token }}`. Pas de lien `{{ .ConfirmationURL }}`.

---

## Vérification

1. Inscription avec un email
2. Réception de l'email avec le code
3. Saisie du code dans l'app → validation → écran "Créer un mot de passe"
