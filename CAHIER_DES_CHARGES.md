# CAHIER DES CHARGES
## Application de Réservation VTC - Paris Airport Disney Prestige Transfer

---

### 📋 TABLE DES MATIÈRES

1. [Informations Générales](#1-informations-générales)
2. [Architecture Technique](#2-architecture-technique)
3. [Fonctionnalités Détaillées](#3-fonctionnalités-détaillées)
4. [Interface Utilisateur](#4-interface-utilisateur)
5. [Système de Tarification](#5-système-de-tarification)
6. [Système d'Email](#6-système-demail)
7. [Sécurité](#7-sécurité)
8. [Flux de Données](#8-flux-de-données)
9. [Grille Tarifaire](#9-grille-tarifaire)
10. [Installation et Déploiement](#10-installation-et-déploiement)

---

## 1. INFORMATIONS GÉNÉRALES

### 1.1 Présentation du Projet
**Nom :** Paris Airport Disney Prestige Transfer - Booking System  
**Version :** 1.0.0  
**Type :** Application web de réservation VTC  
**Entreprise :** Paris Airport Disney Prestige Transfer  
**Adresse :** 119 Avenue Carnot, 93140 Bondy  
**Contact :** +33 7 51 37 61 84  
**Email :** booking@parisairportdisneyprestigetransfer.fr  
**Site Web :** www.parisairportdisneyprestigetransfer.fr  

### 1.2 Objectifs
- Permettre aux clients de réserver facilement des trajets VTC
- Offrir des services d'excursions touristiques
- Automatiser la gestion des réservations
- Intégrer un système de confirmation par email
- Fournir une interface multilingue (principalement anglais)

### 1.3 Public Cible
- Voyageurs internationaux
- Touristes visitant Paris et ses environs
- Clients d'hôtels Disney
- Passagers d'aéroports (CDG, Orly, Beauvais)
- Groupes et familles

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Technologies Utilisées

#### Frontend
- **Framework :** React 18.3.1
- **Build Tool :** Vite 4.5.0
- **Language :** JavaScript (ES6+)
- **Styling :** CSS3, CSS Modules

#### Backend
- **Language :** PHP 7.4+
- **Email System :** PHP Mail Function
- **Data Storage :** JSON Files
- **Server :** Apache/Nginx

#### Bibliothèques Principales
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-datepicker": "^4.25.0",
  "react-google-recaptcha": "^3.1.0",
  "react-select": "^5.8.0"
}
```

### 2.2 Structure du Projet

```
React+form/
├── public/
│   ├── images/           # Assets visuels
│   │   ├── logo.png
│   │   ├── mercedes.jpg
│   │   ├── van_vito.jpg
│   │   ├── van_standard.jpg
│   │   └── background.jpg
│   └── booking-taxi/     # Scripts PHP backend
├── src/
│   ├── components/       # Composants React
│   │   ├── BookingFormApp.jsx
│   │   ├── Step1_TripSelection.jsx
│   │   ├── Step1b_TripOptions.jsx
│   │   ├── Step2_CustomerInfo.jsx
│   │   └── Step3_Recap.jsx
│   ├── data/            # Données statiques
│   │   ├── destinations.js
│   │   ├── excursions.js
│   │   ├── tarifsVtc.js
│   │   └── phoneCodes.js
│   └── translations/    # Système de traduction
├── send-mail.php       # Endpoint trajets normaux
├── send-mail-excursion.php  # Endpoint excursions
├── confirm-mail (2).php     # Confirmation trajets
├── confirm-mail-excursion.php  # Confirmation excursions
└── bookings/          # Stockage JSON des réservations
```

---

## 3. FONCTIONNALITÉS DÉTAILLÉES

### 3.1 Types de Réservation

#### 3.1.1 Trajets Standards
- **One-Way (Aller Simple)** : Point A → Point B
- **Round-Trip (Aller-Retour)** : Point A → Point B → Point A

#### 3.1.2 Excursions Touristiques
- Paris 4h / 6h / 8h / 10h
- Paris by night 4h
- Château de Versailles (aller simple/retour)
- Paris + Versailles (aller simple/retour)
- Normandy Beach / Omaha Beach
- Mont Saint Michel
- Vallée de la Loire
- Normandie
- Giverny

### 3.2 Destinations Disponibles

#### 3.2.1 Aéroports
- **CDG** (Charles de Gaulle)
- **Orly**
- **Beauvais**

#### 3.2.2 Zones Touristiques
- **Paris** (centre ville)
- **Disneyland Paris**
- **Versailles**
- **Château de Versailles**

#### 3.2.3 Destinations Longue Distance
- **Reims**
- **Fontainebleau**
- **Le Havre**
- **Épernay**
- **Tours**
- **Lille**
- **Bayeux**

#### 3.2.4 International
- **Amsterdam** (Pays-Bas)
- **Bruxelles** (Belgique)

### 3.3 Flotte de Véhicules

#### 3.3.1 Van Vito (1-7 passagers)
- **Capacité :** 7 passagers
- **Bagages :** Spacieux
- **Type :** Véhicule premium
- **Image :** van_vito.jpg

#### 3.3.2 Van Standard (8-16 passagers)
- **Capacité :** 8-16 passagers
- **Bagages :** Très spacieux
- **Type :** Transport de groupe
- **Image :** van_standard.jpg

#### 3.3.3 Mercedes (1-3 passagers)
- **Capacité :** 3 passagers
- **Bagages :** Standard
- **Type :** Véhicule de luxe
- **Image :** mercedes.jpg

### 3.4 Système de Réservation Multi-Étapes

#### Étape 1 : Sélection du Trajet
```javascript
// États principaux
- tripType: "one-way" | "round-trip" | "excursion"
- departure: string (code destination)
- arrival: string (code destination)
- selectedExcursion: string (pour excursions)
- departureDate: Date
- returnDate: Date | null
```

#### Étape 1b : Options de Trajet
```javascript
// Options spécifiques
- selectedHotel: Object | null (hôtels Disney)
- hotelOther: string (autre hôtel)
- departureAddress: string
- arrivalAddress: string
- passengers: number (1-16)
- childSeats: number (0-4)
- luggage: number (0-10)
```

#### Étape 2 : Informations Client
```javascript
// Données client
- fullName: string
- email: string
- phone: string
- phoneCode: string (par défaut +33)
- flightNumber: string
- comment: string
```

#### Étape 3 : Récapitulatif et Validation
```javascript
// Validation finale
- price: number (calculé automatiquement)
- selectedVehicle: string (assigné selon passagers)
- captchaToken: string (reCAPTCHA v3)
```

---

## 4. INTERFACE UTILISATEUR

### 4.1 Design System

#### 4.1.1 Palette de Couleurs
- **Primaire :** #2ecc71 (Vert - trajets normaux)
- **Secondaire :** #e67e22 (Orange - excursions)
- **Accent :** #4285F4 (Bleu - Google Calendar)
- **Neutre :** #333333 (Texte principal)
- **Fond :** #f4f4f4 (Arrière-plan)

#### 4.1.2 Typographie
- **Police :** 'Segoe UI', sans-serif
- **Tailles :** 14px (base), 16px (moyen), 18px (grand), 22px (titre)

#### 4.1.3 Composants UI
```css
.step-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
}

.btn-primary {
  background: #2ecc71;
  color: white;
  padding: 12px 25px;
  border-radius: 6px;
  font-weight: bold;
}

.btn-excursion {
  background: #e67e22;
  color: white;
}
```

### 4.2 Responsive Design
- **Mobile First :** Optimisé pour les écrans mobiles
- **Breakpoints :**
  - Mobile : < 768px
  - Tablet : 768px - 1024px
  - Desktop : > 1024px

### 4.3 Accessibilité
- Contraste de couleurs respecté (WCAG 2.1)
- Navigation au clavier
- Attributs ARIA pour les composants interactifs
- Labels explicites sur tous les champs

---

## 5. SYSTÈME DE TARIFICATION

### 5.1 Structure Tarifaire

#### 5.1.1 Index des Véhicules
```javascript
const vehicleIndex = {
  "mercedes": [0, 1, 2, 3],      // 1-4 passagers
  "van_vito": [4, 5, 6, 7],      // 5-8 passagers  
  "van_standard": [8, 9, 10, 11, 12, 13, 14, 15]  // 9-16 passagers
};
```

#### 5.1.2 Calcul Automatique
```javascript
// Exemple de calcul pour CDG → Disney, 3 passagers
const route = "cdg-disney";
const tripType = "one-way";
const passengers = 3;
const vehicleType = "mercedes"; // Auto-assigné
const priceIndex = 2; // passagers - 1
const price = tarifsVtc[tripType][route][priceIndex]; // 70€
```

#### 5.1.3 Supplément Nuit
- **Horaires :** 21h00 - 06h00
- **Montant :** +15€ (trajets normaux) / +10€ (excursions)
- **Application :** Automatique selon l'heure de départ

### 5.2 Tarifs Excursions
```javascript
// Exemple Paris 4h
const excursionPrices = {
  "1-4": 240,   // 1 à 4 passagers
  "5-8": 260,   // 5 à 8 passagers
  "9-12": 500,  // 9 à 12 passagers
  "13-16": 520  // 13 à 16 passagers
};
```

---

## 6. SYSTÈME D'EMAIL

### 6.1 Architecture Double Endpoint

#### 6.1.1 Trajets Normaux
- **Endpoint :** `send-mail.php`
- **Conditions :** `tripType !== "excursion"`
- **Couleur :** Thème vert (#2ecc71)

#### 6.1.2 Excursions
- **Endpoint :** `send-mail-excursion.php`
- **Conditions :** `tripType === "excursion"`
- **Couleur :** Thème orange (#e67e22)

### 6.2 Types d'Emails

#### 6.2.1 Email Admin (Nouvelle Réservation)
```php
// En-têtes
From: booking@parisairportdisneyprestigetransfer.fr
Reply-To: [Client Name] <[client_email]>
Subject: 🚖 New Booking Request - [Route] - [Client]

// Contenu
- Informations client complètes
- Détails du trajet/excursion
- Bouton de confirmation
- Lien Google Calendar
- ID de réservation
```

#### 6.2.2 Email Client (Confirmation Réception)
```php
// En-têtes  
From: booking@parisairportdisneyprestigetransfer.fr
Reply-To: booking@parisairportdisneyprestigetransfer.fr
Subject: ✅ Booking Request Received - [Route]

// Contenu
- Remerciements
- Récapitulatif de la demande
- Informations pratiques
- Coordonnées de contact
```

#### 6.2.3 Email Confirmation Finale
```php
// Endpoints
confirm-mail (2).php      // Trajets normaux
confirm-mail-excursion.php // Excursions

// Fonctionnalités
- Bcc automatique aux admins
- Bouton Google Calendar
- Bouton d'appel direct
- Design professionnel
- Support hôtels Disney
```

### 6.3 Intégration Google Calendar

#### 6.3.1 Paramètres
```javascript
const googleCalendarLink = 
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent("Booking PADPT - ClientName") +
  "&dates=" + startDate + "/" + endDate +
  "&details=" + encodeURIComponent(details) +
  "&location=" + encodeURIComponent(address);
```

#### 6.3.2 Durées
- **Trajets normaux :** Événement ponctuel
- **Excursions :** Durée de 4 heures

---

## 7. SÉCURITÉ

### 7.1 Protection reCAPTCHA

#### 7.1.1 Configuration
```javascript
// reCAPTCHA v3
const RECAPTCHA_SITE_KEY = "6LfuxpsrAAAAAFZjJw8hOw8hOw8h";
const RECAPTCHA_SECRET = "6LfuxpsrAAAAAPA3NxXAEodkgYHZ";
const RECAPTCHA_MIN_SCORE = 0.4;
```

#### 7.1.2 Validation côté serveur
```php
$captchaRes = json_decode(file_get_contents(
  'https://www.google.com/recaptcha/api/siteverify' .
  '?secret=' . RECAPTCHA_SECRET .
  '&response=' . $captchaToken
), true);

if (!$captchaRes['success'] || $captchaRes['score'] < 0.4) {
  json_err('Captcha invalide', 400);
}
```

### 7.2 Validation des Données

#### 7.2.1 Côté Client (React)
- Validation en temps réel des champs
- Format email et téléphone
- Dates cohérentes
- Nombre de passagers valide

#### 7.2.2 Côté Serveur (PHP)
```php
// Validation email
$email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
if (!$email) json_err("E-mail invalide", 400);

// Validation téléphone
if (!preg_match('/^[0-9+()\s.-]{6,20}$/', $phoneRaw)) {
  json_err("Téléphone invalide", 400);
}

// Échappement HTML
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
```

### 7.3 Protection des Données

#### 7.3.1 Stockage JSON
- Fichiers stockés dans `/bookings/`
- Accès restreint par `.htaccess`
- Permissions 755 sur le dossier

#### 7.3.2 Headers de Sécurité
```php
// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

---

## 8. FLUX DE DONNÉES

### 8.1 Diagramme de Flux Principal

```
[Client] → [React App] → [PHP Backend] → [Email System]
                    ↓
                [JSON Storage] → [Admin Confirmation] → [Final Email]
```

### 8.2 Processus Détaillé

#### 8.2.1 Soumission de Réservation
1. **Collecte des données** dans React (3 étapes)
2. **Validation côté client** (champs obligatoires, formats)
3. **Génération du token reCAPTCHA**
4. **Envoi POST** vers l'endpoint approprié
5. **Validation côté serveur** (sécurité, cohérence)
6. **Calcul automatique du prix**
7. **Génération de l'ID de réservation**
8. **Sauvegarde JSON** dans `/bookings/`
9. **Envoi email admin** (notification nouvelle réservation)
10. **Envoi email client** (confirmation réception)
11. **Réponse JSON** avec statut de succès

#### 8.2.2 Processus de Confirmation
1. **Admin clique** sur le lien de confirmation
2. **Lecture du fichier JSON** de la réservation
3. **Génération de l'email** de confirmation finale
4. **Envoi avec Bcc** aux administrateurs
5. **Affichage du statut** d'envoi

### 8.3 Gestion d'Erreurs

#### 8.3.1 Codes d'Erreur HTTP
- **400 :** Données invalides
- **404 :** Réservation introuvable
- **500 :** Erreur serveur

#### 8.3.2 Messages d'Erreur
```php
// Exemples
json_err("Champ manquant ou vide : email", 400);
json_err("Captcha invalide", 400);
json_err("Impossible d'écrire le fichier", 500);
```

---

## 9. GRILLE TARIFAIRE

### 9.1 TRAJETS ALLER SIMPLE (One-Way)

#### 9.1.1 Aéroports ↔ Paris/Disney

| Route | Mercedes (1-4p) | Van Vito (5-8p) | Van Standard (9-16p) |
|-------|----------------|-----------------|---------------------|
| **CDG ↔ Paris** | 80-110€ | 180-220€ | 180-220€ |
| **CDG ↔ Disney** | 70-90€ | 150-180€ | 150-180€ |
| **Orly ↔ Paris** | 80-100€ | 180-200€ | 180-200€ |
| **Orly ↔ Disney** | 80-90€ | 165-180€ | 165-180€ |
| **Beauvais ↔ Paris** | 140-160€ | 290-320€ | 290-320€ |
| **Beauvais ↔ Disney** | 150-170€ | 320-340€ | 320-340€ |

#### 9.1.2 Liaisons Inter-Aéroports

| Route | Mercedes (1-4p) | Van Vito (5-8p) | Van Standard (9-16p) |
|-------|----------------|-----------------|---------------------|
| **CDG ↔ Orly** | 90-105€ | 190-210€ | 190-210€ |
| **CDG ↔ Beauvais** | 140-150€ | 290-300€ | 290-300€ |
| **Orly ↔ Beauvais** | 170-180€ | 350-360€ | 350-360€ |

#### 9.1.3 Destinations Longue Distance

| Route | Mercedes (1-4p) | Van Vito (5-8p) | Van Standard (9-16p) |
|-------|----------------|-----------------|---------------------|
| **Reims** | 300-320€ | 610-640€ | 610-640€ |
| **Versailles** | 80-130€ | 185-260€ | 185-260€ |
| **Fontainebleau** | 145-180€ | 295-360€ | 295-360€ |
| **Le Havre** | 420-460€ | 870-920€ | 870-920€ |
| **Épernay** | 315-340€ | 645-680€ | 645-680€ |
| **Tours** | 525-575€ | 1075-1150€ | 1075-1150€ |
| **Lille** | 415-475€ | 845-950€ | 845-950€ |
| **Bayeux** | 500-520€ | 1010-1040€ | 1010-1040€ |

#### 9.1.4 International

| Route | Mercedes (1-4p) | Van Vito (5-8p) | Van Standard (9-16p) |
|-------|----------------|-----------------|---------------------|
| **Amsterdam** | 1100-1300€ | 2300-2600€ | 2300-2600€ |
| **Bruxelles** | 635-680€ | 1285-1360€ | 1285-1360€ |

### 9.2 TRAJETS ALLER-RETOUR (Round-Trip)

#### 9.2.1 Principales Destinations

| Route | Mercedes (1-4p) | Van Vito (5-8p) | Van Standard (9-16p) |
|-------|----------------|-----------------|---------------------|
| **CDG-Paris-CDG** | 160-220€ | 360-440€ | 360-440€ |
| **CDG-Disney-CDG** | 140-180€ | 300-360€ | 300-360€ |
| **Orly-Paris-Orly** | 160-200€ | 360-400€ | 360-400€ |
| **Orly-Disney-Orly** | 160-180€ | 330-360€ | 330-360€ |
| **Disney-Paris-Disney** | 180-200€ | 380-400€ | 380-400€ |

#### 9.2.2 Longue Distance (Round-Trip)

| Route | Mercedes (1-4p) | Van Vito (5-8p) | Van Standard (9-16p) |
|-------|----------------|-----------------|---------------------|
| **Reims A/R** | 600-640€ | 1220-1280€ | 1220-1280€ |
| **Fontainebleau A/R** | 290-360€ | 590-720€ | 590-720€ |
| **Le Havre A/R** | 840-920€ | 1740-1840€ | 1740-1840€ |

### 9.3 EXCURSIONS TOURISTIQUES

#### 9.3.1 Excursions Paris

| Excursion | 1-4 passagers | 5-8 passagers | 9-12 passagers | 13-16 passagers |
|-----------|---------------|---------------|----------------|-----------------|
| **Paris 4h** | 240€ | 260€ | 500€ | 520€ |
| **Paris by night 4h** | 240€ | 280€ | 520€ | 560€ |
| **Paris 6h** | 390€ | 390€ | 780€ | 780€ |
| **Paris 8h** | 520€ | 520€ | 1040€ | 1040€ |
| **Paris 10h** | 650€ | 650€ | 1300€ | 1300€ |

#### 9.3.2 Excursions Versailles

| Excursion | 1-4 passagers | 5-8 passagers | 9-12 passagers | 13-16 passagers |
|-----------|---------------|---------------|----------------|-----------------|
| **Château Versailles A/R** | 180€ | 200€ | 380€ | 400€ |
| **Château Versailles A/S** | 90€ | 100€ | 190€ | 200€ |
| **Paris + Versailles A/R** | 160€ | 240€ | 400€ | 480€ |
| **Paris + Versailles A/S** | 80€ | 120€ | 200€ | 240€ |

#### 9.3.3 Excursions Région

| Excursion | 1-4 passagers | 5-8 passagers | 9-12 passagers | 13-16 passagers |
|-----------|---------------|---------------|----------------|-----------------|
| **Normandy Beach** | 700€ | 830€ | 1530€ | 1660€ |
| **Omaha Beach** | 700€ | 830€ | 1530€ | 1660€ |
| **Mont Saint Michel** | 750€ | 775€ | 1525€ | 1550€ |
| **Vallée de la Loire** | 700€ | 750€ | 1450€ | 1500€ |
| **Normandie** | 550€ | 630€ | 1180€ | 1260€ |
| **Giverny** | 400€ | 425€ | 825€ | 850€ |

### 9.4 SUPPLÉMENTS

#### 9.4.1 Supplément Nuit
- **Horaires :** 21h00 → 06h00
- **Montant :** +15€ (trajets) / +10€ (excursions)
- **Application :** Automatique

#### 9.4.2 Sièges Enfant
- **Disponibles :** 0-4 sièges
- **Tarif :** Inclus dans le prix
- **Obligation :** Selon réglementation française

#### 9.4.3 Bagages
- **Standard :** Inclus (1-2 valises/passager)
- **Supplémentaire :** Sur demande
- **Véhicules :** Espace optimisé selon le modèle

---

## 10. INSTALLATION ET DÉPLOIEMENT

### 10.1 Prérequis Système

#### 10.1.1 Serveur
- **OS :** Linux (Ubuntu/CentOS) ou Windows Server
- **Serveur Web :** Apache 2.4+ ou Nginx 1.18+
- **PHP :** Version 7.4 minimum (8.0+ recommandé)
- **Extensions PHP :** mbstring, json, curl, openssl

#### 10.1.2 Développement
- **Node.js :** Version 16+ (pour Vite)
- **NPM :** Version 8+
- **Git :** Pour le versioning

### 10.2 Installation

#### 10.2.1 Clonage et Dépendances
```bash
# Cloner le projet
git clone [repository-url]
cd React+form

# Installer les dépendances Node.js
npm install

# Build de production
npm run build
```

#### 10.2.2 Configuration Serveur
```apache
# .htaccess pour Apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L,QSA]

# Protection dossier bookings
<Directory "bookings">
    Order Deny,Allow
    Deny from all
</Directory>
```

#### 10.2.3 Configuration PHP
```php
// Paramètres à ajuster dans send-mail.php
const RECAPTCHA_SECRET = 'your-secret-key';
const ADMIN_EMAIL = 'your-admin@domain.com';
const FROM_EMAIL = 'noreply@domain.com';

// Permissions dossier
chmod 755 bookings/
```

### 10.3 Variables d'Environnement

#### 10.3.1 Production
```env
NODE_ENV=production
VITE_RECAPTCHA_SITE_KEY=6LfuxpsrAAAAAFZjJw8h...
VITE_API_URL=https://yourdomain.com
```

#### 10.3.2 Développement
```env
NODE_ENV=development
VITE_RECAPTCHA_SITE_KEY=test-key
VITE_API_URL=http://localhost
```

### 10.4 Monitoring et Maintenance

#### 10.4.1 Logs d'Application
- **PHP Errors :** `/var/log/apache2/error.log`
- **Bookings :** Fichiers JSON dans `/bookings/`
- **Email Status :** Log via `error_log()`

#### 10.4.2 Sauvegarde
```bash
# Script de sauvegarde quotidienne
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf "backup_$DATE.tar.gz" bookings/
# Upload vers stockage distant
```

#### 10.4.3 Mise à Jour
```bash
# Processus de mise à jour
git pull origin main
npm ci
npm run build
# Redémarrage serveur si nécessaire
```

### 10.5 Tests et Validation

#### 10.5.1 Tests Fonctionnels
- [ ] Réservation trajet standard
- [ ] Réservation excursion
- [ ] Calcul automatique des prix
- [ ] Envoi des emails
- [ ] Validation reCAPTCHA
- [ ] Responsive design
- [ ] Intégration Google Calendar

#### 10.5.2 Tests de Charge
- **Concurrent Users :** 50+
- **Response Time :** < 2s
- **Email Delivery :** < 30s

---

## ANNEXES

### A. Contacts Équipe

**Développement :** GitHub Copilot  
**Client :** Paris Airport Disney Prestige Transfer  
**Email Support :** booking@parisairportdisneyprestigetransfer.fr  
**Téléphone :** +33 7 51 37 61 84  

### B. URLs Importantes

- **Site Principal :** https://parisairportdisneyprestigetransfer.fr
- **Booking Form :** https://parisairportdisneyprestigetransfer.fr/booking-taxi/
- **Admin Panel :** Accès via liens de confirmation email

### C. Versions et Historique

- **v1.0.0** (Septembre 2025) : Version initiale complète
  - Système de réservation multi-étapes
  - Dual-endpoint pour trajets/excursions
  - Integration Google Calendar
  - Support hôtels Disney
  - Système de confirmation avec Bcc admin

---

**Document généré le :** 18 septembre 2025  
**Version du cahier des charges :** 1.0  
**Statut :** Production Ready ✅

---

*Ce document constitue la spécification technique complète de l'application de réservation VTC. Il doit être mis à jour à chaque évolution majeure du système.*