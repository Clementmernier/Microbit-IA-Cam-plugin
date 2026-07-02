---
type: 'Page'
title: Serveur MakeCode offline (Raspberry Pi)
aliases: null
description: null
icon: null
createdAt: '2026-07-02T09:14:00.683Z'
lastUpdated: '2026-07-02T09:16:03.128Z'
tags: []
coverImage: null
---



## Vue d'ensemble

Le Raspberry Pi (`pso_server@10.42.0.1`) héberge une instance PXT/MakeCode statique servie en local, sans accès internet, à destination des micro:bit connectés au point d'accès WiFi du Pi.

**Architecture :**

```text
[Build local] --rsync/cp--> ~/makecode-static (staging) --sync--> /var/www/makecode (servi par nginx)
```

- `~/makecode-static` : dossier de staging sur le Pi. C'est le point de passage obligé pour tout transfert — on ne pousse jamais directement le build dans `/var/www/makecode`.

- `/var/www/makecode` : racine servie par nginx, lue par les clients (navigateurs / micro:bit) connectés au réseau WiFi du Pi.

- **hostapd** : génère le point d'accès WiFi sur l'interface `wlan1` (clé WiFi USB dédiée), permettant aux appareils de se connecter au Pi sans passerelle internet.

- **nginx** : sert les fichiers statiques de `/var/www/makecode` sur le réseau local.

## Génération du site static (côté machine de dev)

Avant de pouvoir transférer quoi que ce soit vers le Pi, il faut générer le build statique de PXT/MakeCode.

### 1. Cloner pxt-microbit

```bash
git clone https://github.com/microsoft/pxt-microbit.git
cd pxt-microbit
```

### 2. Installer les dépendances

```bash
npm install
```

Installer aussi l'outil `pxt` en global si ce n'est pas déjà fait :

```bash
npm install -g pxt
```

### 3. Build du target

```bash
pxt build
```

### 4. Servir en local pour tester avant publication

```bash
pxt serve
```

Ouvre normalement `http://localhost:3232` (ou port similaire) — permet de vérifier que tout fonctionne (extensions comprises) avant de générer le package statique.

### 5. Générer le package statique

```bash
pxt staticpkg
```

Cette commande génère le dossier `built/packaged`, qui est exactement ce qui doit être transféré vers `~/makecode-static` sur le Pi (voir section suivante).

> Le cycle complet est donc : `npm install` (une fois) → `pxt build` → `pxt serve` (test optionnel) → `pxt staticpkg` → transfert vers le Pi.

## Procédure pour ajouter une extension/lib

1. **Ajouter la lib dans le projet cible** (soit via l'éditeur MakeCode en local avec `pxt serve`, soit en modifiant directement `pxt.json` du projet/target pour y référencer l'extension — dépôt Git ou chemin local).

2. **Si c'est une extension custom (dépôt local ou repo Git privé)** : s'assurer qu'elle est accessible sans connexion internet, puisque le site final est offline. Deux options :

    - L'inclure comme dépendance locale (dossier copié dans le projet, référencée par chemin relatif dans `pxt.json`).

    - La packager dans le target lui-même si elle doit être disponible par défaut pour tous les projets.

3. **Rebuild** :

    ```bash
    pxt build
    ```

4. **Tester en local** :

    ```bash
    pxt serve
    ```

    Vérifier dans l'éditeur que l'extension apparaît bien dans la liste des extensions disponibles, et qu'elle compile correctement (`.hex` généré sans erreur).

5. **Régénérer le package statique** :

    ```bash
    pxt staticpkg
    ```

6. **Transférer et publier** (voir workflow complet plus bas) :

    ```bash
    rsync -avz built/packaged/ pso_server@10.42.0.1:~/makecode-static/
    ssh pso_server@10.42.0.1 "sudo rsync -av --delete /home/pso_server/makecode-static/ /var/www/makecode/ && sudo chown -R www-data:www-data /var/www/makecode"
    ```

7. **Vider le cache navigateur côté client** (service worker + hard refresh) avant de vérifier que l'extension apparaît sur le site publié — sinon l'ancienne version en cache peut masquer la mise à jour.

## Commandes utiles (transfert et publication)

### 1. Transfert du build local vers le Pi (staging)

Depuis la machine de dev, après un build (`built/packaged`) :

```bash
rsync -avz built/packaged/ pso_server@10.42.0.1:~/makecode-static/
```

### 2. Publication : staging → site servi (sur le Pi)

En SSH sur le Pi, ou en une seule commande depuis la machine de dev :

```bash
ssh pso_server@10.42.0.1
sudo rsync -av --delete /home/pso_server/makecode-static/ /var/www/makecode/
```

`--delete` garantit que le site reflète exactement le contenu du staging (supprime les fichiers obsolètes).

### 3. Vider puis republier manuellement (alternative)

```bash
sudo rm -rf /var/www/makecode/*
sudo cp -r /home/pso_server/makecode-static/* /var/www/makecode/
```

*(Préférer la méthode rsync* `--delete`*, plus sûre et qui gère les dotfiles.)*

### 4. Permissions après publication

Le serveur web (nginx) tourne sous `www-data`. S'assurer que les fichiers publiés sont lisibles :

```bash
sudo chown -R www-data:www-data /var/www/makecode
# ou, si on veut garder pso_server propriétaire :
sudo chmod -R o+rX /var/www/makecode
```

### 5. Créer le dossier de destination s'il n'existe pas

```bash
sudo mkdir -p /var/www/makecode
sudo chown pso_server:pso_server /var/www/makecode
```

### 6. Vérifier nginx

```bash
sudo systemctl status nginx
sudo nginx -t                     # tester la config
sudo systemctl reload nginx       # recharger après modif de config
```

Config du site généralement dans `/etc/nginx/sites-available/` (ou `/etc/nginx/conf.d/`), avec un `root /var/www/makecode;`.

### 7. Vérifier hostapd (point d'accès WiFi)

```bash
sudo systemctl status hostapd
sudo journalctl -u hostapd -f     # logs en direct
```

Config généralement dans `/etc/hostapd/hostapd.conf`, avec `interface=wlan1`.

### 8. Vérifier l'interface réseau wlan1

```bash
ip a show wlan1
iwconfig wlan1
```

### 9. Debug rapide côté client

Si une extension ou un fichier n'apparaît pas côté navigateur alors qu'il est bien présent sur le Pi :

- Vérifier avec l'onglet **Réseau** des DevTools que le fichier est bien chargé (pas de 404) et servi avec le bon `Content-Type`.

- Désinscrire le **Service Worker** et vider le cache du site (souvent la cause n°1 sur PXT/MakeCode).

- Hard refresh : `Ctrl+Shift+R`.

## Workflow complet (résumé)

```bash
# 1. Build local
# (génère built/packaged)
# 2. Envoi vers le staging sur le Pi
rsync -avz built/packaged/ pso_server@10.42.0.1:~/makecode-static/
# 3. Publication vers le site servi
ssh pso_server@10.42.0.1 "sudo rsync -av --delete /home/pso_server/makecode-static/ /var/www/makecode/ && sudo chown -R www-data:www-data /var/www/makecode"
```

