# Fix - Erreur Upload 400 (Bad Request)

## ❌ Problème
L'upload du reçu échoue avec une erreur 400 (Bad Request).

## 🔍 Causes Possibles

### 1. Type de fichier non autorisé
Le type MIME du fichier n'est pas dans la liste autorisée.

### 2. Fichier trop volumineux
Le fichier dépasse 5MB.

### 3. Fichier vide ou corrompu
Le fichier n'est pas reçu correctement par l'API.

### 4. Type MIME manquant
Certains navigateurs n'envoient pas le type MIME correctement.

## ✅ Solutions Appliquées

### 1. Validation Plus Permissive

**Avant :**
```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
if (!allowedTypes.includes(file.type)) {
  return 400
}
```

**Après :**
```typescript
// Vérifier par type MIME ET par extension
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf']

const fileExt = file.name.split('.').pop()?.toLowerCase()
const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExt || '')
```

### 2. Messages d'Erreur Détaillés

Maintenant l'API retourne :
```json
{
  "error": "Type de fichier non autorisé",
  "details": "Type reçu: image/jpg, Extension: jpg"
}
```

### 3. Logs Détaillés

**Côté Client :**
```typescript
console.log('Uploading receipt:', {
  name: receiptFile.name,
  size: receiptFile.size,
  type: receiptFile.type
})
```

**Côté Serveur :**
```typescript
console.log('Upload - File info:', {
  hasFile: !!file,
  fileName: file?.name,
  fileSize: file?.size,
  fileType: file?.type,
  fileConstructor: file?.constructor?.name
})
```

### 4. Validation Robuste

- ✅ Vérification que c'est bien un File
- ✅ Validation par type MIME
- ✅ Validation par extension (fallback)
- ✅ Gestion des extensions en minuscules
- ✅ Messages d'erreur explicites

## 🧪 Diagnostic

### Étape 1 : Vérifier les Logs Console

Ouvrez la console du navigateur et cherchez :
```
Uploading receipt: { name: "...", size: ..., type: "..." }
```

### Étape 2 : Vérifier les Logs Serveur

Dans le terminal où tourne `npm run dev`, cherchez :
```
Upload - File info: { hasFile: true, fileName: "...", ... }
```

### Étape 3 : Identifier le Problème

| Log | Problème | Solution |
|-----|----------|----------|
| `hasFile: false` | Fichier non reçu | Vérifier FormData |
| `fileType: ""` | Type MIME manquant | Validation par extension OK |
| `fileSize: 0` | Fichier vide | Fichier corrompu |
| `fileSize: > 5MB` | Trop gros | Compresser le fichier |

## 📋 Types de Fichiers Acceptés

### Types MIME
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`
- `application/pdf`

### Extensions
- `.jpg`
- `.jpeg`
- `.png`
- `.webp`
- `.pdf`

## 🔧 Solutions par Erreur

### "Aucun fichier fourni"
```typescript
// Vérifier que le fichier est bien sélectionné
if (!receiptFile) {
  alert('Veuillez sélectionner un fichier')
  return
}
```

### "Type de fichier non autorisé"
```typescript
// Vérifier le type avant l'upload
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
if (!allowedTypes.includes(receiptFile.type)) {
  alert('Format non supporté. Utilisez JPG, PNG ou PDF')
  return
}
```

### "Fichier trop volumineux"
```typescript
// Vérifier la taille avant l'upload
if (receiptFile.size > 5 * 1024 * 1024) {
  alert('Fichier trop gros. Maximum 5MB')
  return
}
```

## 🎯 Test

### 1. Préparer un Fichier Test
- Format : JPG, PNG ou PDF
- Taille : < 5MB
- Nom : Sans caractères spéciaux

### 2. Tester l'Upload
1. Ouvrez la console (F12)
2. Allez sur `/entreprise/abonnement`
3. Cliquez "Souscrire"
4. Sélectionnez le fichier test
5. Cliquez "Confirmer"
6. Vérifiez les logs

### 3. Logs Attendus

**Console Navigateur :**
```
Uploading receipt: { name: "receipt.jpg", size: 123456, type: "image/jpeg" }
Upload success: { url: "https://...", path: "..." }
```

**Terminal Serveur :**
```
Upload - File info: { hasFile: true, fileName: "receipt.jpg", fileSize: 123456, fileType: "image/jpeg" }
Upload - Buffer created: { bufferSize: 123456 }
Upload - Success: { path: "xxx/subscription_receipt/1234567890.jpg" }
```

## 🐛 Erreurs Courantes

### Erreur : "file.arrayBuffer is not a function"
**Cause :** Le fichier n'est pas un vrai File object
**Solution :** Vérifier que l'input file est correct

### Erreur : "Cannot read property 'split' of undefined"
**Cause :** file.name est undefined
**Solution :** Corrigé avec `?.` et fallback

### Erreur : Type MIME vide
**Cause :** Certains navigateurs ne détectent pas le type
**Solution :** Validation par extension (déjà implémentée)

## 📝 Checklist

- [x] Validation par type MIME
- [x] Validation par extension (fallback)
- [x] Messages d'erreur détaillés
- [x] Logs côté client
- [x] Logs côté serveur
- [x] Gestion des cas limites
- [x] Support WEBP ajouté
- [x] Taille max 5MB
- [x] Extensions en minuscules

## 📚 Fichiers Modifiés

- `app/api/upload/route.ts` - Validation améliorée
- `app/entreprise/abonnement/page.tsx` - Logs ajoutés

---

**Avec ces changements, l'erreur 400 devrait être résolue et vous aurez des logs détaillés pour diagnostiquer tout problème restant.**
