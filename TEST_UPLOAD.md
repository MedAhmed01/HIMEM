# Guide de Test - Upload de Reçu

## 🎯 Objectif
Tester l'upload du reçu de paiement pour les abonnements.

## 📋 Prérequis

- [x] Migration SQL exécutée
- [x] Bucket `receipts` existe dans Supabase
- [x] `SUPABASE_SERVICE_ROLE_KEY` définie
- [x] Serveur démarré (`npm run dev`)
- [x] Connecté en tant qu'entreprise validée

## 🧪 Test Complet

### Étape 1 : Préparer un Fichier Test

Créez ou téléchargez un fichier :
- **Format :** JPG, PNG ou PDF
- **Taille :** < 5MB (idéalement 1-2MB)
- **Nom :** Simple, sans accents (ex: `receipt.jpg`)

### Étape 2 : Ouvrir la Console

1. Ouvrez votre navigateur
2. Appuyez sur **F12** pour ouvrir DevTools
3. Allez dans l'onglet **Console**
4. Gardez-la ouverte pendant le test

### Étape 3 : Accéder à la Page

1. Allez sur `http://localhost:3000/entreprise/abonnement`
2. Vous devriez voir les 3 forfaits (Starter, Business, Premium)

### Étape 4 : Souscrire

1. Cliquez sur **"Souscrire"** sur n'importe quel forfait
2. Un modal s'ouvre avec :
   - Le montant à payer
   - Les instructions de paiement
   - Un champ pour uploader le reçu

### Étape 5 : Uploader le Reçu

1. Cliquez sur **"Choisir un fichier"**
2. Sélectionnez votre fichier test
3. Vérifiez que le nom du fichier apparaît (✓ receipt.jpg)

### Étape 6 : Confirmer

1. Cliquez sur **"Confirmer"**
2. Observez les logs dans la console

### Étape 7 : Vérifier les Logs

#### Console Navigateur (DevTools)

**Logs attendus :**
```javascript
Uploading receipt: {
  name: "receipt.jpg",
  size: 123456,
  type: "image/jpeg"
}

Upload success: {
  url: "https://xxx.supabase.co/storage/v1/object/public/receipts/...",
  path: "xxx/subscription_receipt/1234567890.jpg"
}
```

#### Terminal Serveur

**Logs attendus :**
```
Upload - Auth check: { hasUser: true, userId: 'xxx-xxx-xxx' }
Upload - File info: { 
  hasFile: true, 
  fileName: 'receipt.jpg', 
  fileSize: 123456, 
  fileType: 'image/jpeg' 
}
Upload - Attempting upload: { fileName: 'xxx/subscription_receipt/1234567890.jpg' }
Upload - Buffer created: { bufferSize: 123456 }
Upload - Success: { path: 'xxx/subscription_receipt/1234567890.jpg' }
```

### Étape 8 : Vérifier dans Supabase

1. Allez dans **Supabase Dashboard**
2. Cliquez sur **Storage**
3. Ouvrez le bucket **receipts**
4. Vous devriez voir votre fichier dans `[user-id]/subscription_receipt/`

### Étape 9 : Vérifier l'Abonnement

1. L'abonnement devrait être créé avec statut "pending"
2. Le reçu devrait être attaché (`receipt_url` non null)

## ✅ Résultats Attendus

### Succès ✓
- Message : "Demande d'abonnement créée. En attente de validation..."
- Fichier visible dans Supabase Storage
- Abonnement en statut "pending" dans la DB

### Échec ✗
- Erreur 400 : Voir `FIX_UPLOAD_400.md`
- Erreur 401 : Voir `FIX_UPLOAD_401.md`
- Erreur 500 : Vérifier les logs serveur

## 🐛 Diagnostic des Erreurs

### Erreur 400 - Bad Request

**Vérifier dans les logs :**
```javascript
// Si vous voyez :
Upload - File info: { hasFile: false }
// → Le fichier n'est pas reçu

// Si vous voyez :
Upload - File info: { fileType: "" }
// → Type MIME manquant (OK, validation par extension)

// Si vous voyez :
Upload - File info: { fileSize: 0 }
// → Fichier vide ou corrompu
```

**Solutions :**
- Essayez un autre fichier
- Vérifiez que le fichier n'est pas corrompu
- Essayez un format différent (JPG → PNG)

### Erreur 401 - Unauthorized

**Vérifier :**
```javascript
// Dans la console
document.cookie
// Devrait contenir des cookies "sb-"
```

**Solutions :**
- Déconnectez-vous et reconnectez-vous
- Videz le cache du navigateur
- Vérifiez que vous êtes bien connecté

### Erreur 500 - Internal Server Error

**Vérifier dans les logs serveur :**
```
Upload error: [détails de l'erreur]
```

**Solutions :**
- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est définie
- Vérifiez que le bucket `receipts` existe
- Vérifiez les permissions du bucket

## 📊 Matrice de Test

| Fichier | Taille | Format | Résultat Attendu |
|---------|--------|--------|------------------|
| receipt.jpg | 1MB | JPG | ✅ Succès |
| receipt.png | 2MB | PNG | ✅ Succès |
| receipt.pdf | 3MB | PDF | ✅ Succès |
| receipt.webp | 1MB | WEBP | ✅ Succès |
| large.jpg | 6MB | JPG | ❌ Trop gros |
| doc.txt | 1KB | TXT | ❌ Type non autorisé |
| empty.jpg | 0B | JPG | ❌ Fichier vide |

## 🔄 Test Sans Reçu

L'upload du reçu est **optionnel**. Testez aussi sans fichier :

1. Cliquez "Souscrire"
2. **Ne sélectionnez pas de fichier**
3. Cliquez "Confirmer"
4. ✅ Devrait créer l'abonnement sans reçu

## 📝 Checklist de Test

- [ ] Fichier JPG < 5MB : ✅ Succès
- [ ] Fichier PNG < 5MB : ✅ Succès
- [ ] Fichier PDF < 5MB : ✅ Succès
- [ ] Fichier > 5MB : ❌ Erreur "trop gros"
- [ ] Fichier TXT : ❌ Erreur "type non autorisé"
- [ ] Sans fichier : ✅ Succès (optionnel)
- [ ] Logs console : ✅ Visibles
- [ ] Logs serveur : ✅ Visibles
- [ ] Fichier dans Storage : ✅ Visible
- [ ] Abonnement créé : ✅ Statut "pending"

## 🎓 Commandes Utiles

### Vérifier les abonnements en DB
```sql
SELECT * FROM entreprise_subscriptions 
WHERE payment_status = 'pending' 
ORDER BY created_at DESC;
```

### Vérifier les fichiers uploadés
```sql
SELECT * FROM storage.objects 
WHERE bucket_id = 'receipts' 
ORDER BY created_at DESC;
```

### Nettoyer les tests
```sql
-- Supprimer les abonnements de test
DELETE FROM entreprise_subscriptions 
WHERE payment_status = 'pending' 
AND created_at > NOW() - INTERVAL '1 hour';
```

## 📚 Documentation

- **Erreur 400 :** `FIX_UPLOAD_400.md`
- **Erreur 401 :** `FIX_UPLOAD_401.md`
- **Troubleshooting :** `TROUBLESHOOTING_UPLOAD.md`

---

**Bon test ! 🧪**
