# Configuration du Formulaire de Contact

## ✅ Ce qui a été fait

### 1. API de Contact
- **Fichier :** `app/api/contact/route.ts`
- Reçoit les messages du formulaire
- Sauvegarde dans la base de données
- Validation des données

### 2. Table Base de Données
- **Migration :** `supabase/migrations/create_contact_messages.sql`
- Table `contact_messages` créée
- Champs : name, email, phone, subject, message, status
- Policies RLS configurées

### 3. Formulaire Fonctionnel
- **Page :** `app/contact/page.tsx`
- Formulaire avec validation
- Messages de succès/erreur
- Champs requis marqués

### 4. Interface Admin
- **Page :** `app/admin/messages`
- Liste tous les messages reçus
- Bouton "Répondre" qui ouvre l'email
- Statuts : nouveau, lu, répondu, archivé

## 🚀 Déploiement

### Étape 1 : Créer la Table
Exécutez dans Supabase SQL Editor :
```sql
-- Contenu de: supabase/migrations/create_contact_messages.sql
```

### Étape 2 : Tester le Formulaire
1. Allez sur `/contact`
2. Remplissez le formulaire
3. Cliquez "Envoyer"
4. ✅ Message de succès

### Étape 3 : Voir les Messages (Admin)
1. Connectez-vous en tant qu'admin
2. Allez sur `/admin/messages`
3. Voyez tous les messages reçus
4. Cliquez "Répondre" pour ouvrir votre client email

## 📧 Email de Notification

Pour recevoir un email à **MedAhmed28234@gmail.com** quand un message arrive, vous avez 2 options :

### Option 1 : Service d'Email (Recommandé)

Utilisez **Resend** (gratuit jusqu'à 3000 emails/mois) :

1. **Créez un compte sur** https://resend.com
2. **Obtenez votre API key**
3. **Ajoutez dans `.env.local` :**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

4. **Installez Resend :**
```bash
npm install resend
```

5. **Modifiez `app/api/contact/route.ts` :**
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Après avoir sauvegardé dans la DB, ajoutez :
await resend.emails.send({
  from: 'OMIGEC <onboarding@resend.dev>',
  to: 'MedAhmed28234@gmail.com',
  subject: `Nouveau message de ${name}`,
  html: `
    <h2>Nouveau message de contact</h2>
    <p><strong>De:</strong> ${name} (${email})</p>
    <p><strong>Téléphone:</strong> ${phone || 'Non fourni'}</p>
    <p><strong>Sujet:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `
})
```

### Option 2 : Webhook/Notification

Configurez une notification Supabase qui envoie un webhook quand un nouveau message arrive.

### Option 3 : Vérification Manuelle

Consultez régulièrement `/admin/messages` pour voir les nouveaux messages.

## 📋 Checklist

- [x] Table `contact_messages` créée
- [x] API `/api/contact` fonctionnelle
- [x] Formulaire avec validation
- [x] Messages de succès/erreur
- [x] Page admin `/admin/messages`
- [x] Lien dans le menu admin
- [ ] Service d'email configuré (optionnel)

## 🧪 Test

### Test Utilisateur
1. Allez sur `/contact`
2. Remplissez :
   - Nom : Test User
   - Email : test@example.com
   - Message : Ceci est un test
3. Cliquez "Envoyer"
4. ✅ Message de succès

### Test Admin
1. Connectez-vous en tant qu'admin
2. Allez sur `/admin/messages`
3. ✅ Voyez le message de test
4. Cliquez "Répondre"
5. ✅ Votre client email s'ouvre

## 📊 Statuts des Messages

- **Nouveau** (new) : Message non lu
- **Lu** (read) : Message consulté
- **Répondu** (replied) : Réponse envoyée
- **Archivé** (archived) : Message archivé

## 🔒 Sécurité

- ✅ Validation des emails
- ✅ Champs requis
- ✅ RLS activé sur la table
- ✅ Seuls les admins peuvent voir les messages
- ✅ Tout le monde peut envoyer (formulaire public)

---

**Le formulaire est prêt ! Les messages sont sauvegardés dans la DB et visibles dans `/admin/messages` 🎉**
