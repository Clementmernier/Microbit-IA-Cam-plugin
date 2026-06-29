/**
 * caméra_PSO.ts
 * Extension MakeCode simplifiée pour HuskyLens + Maqueen V2.1 Plus
 * Basée sur la bibliothèque officielle DFRobot HuskyLens
 *
 * Fonctions principales :
 * * Initialisation caméra
 * * Changement de mode IA
 * * Oublier les données IA
 * * Suivi de ligne IA
 * * Suivi d'objet IA
 *
 * Auteur : PSO
 */

enum CameraModePSO {
    //% block="Reconnaissance de visage"
    Visage = 0,
    //% block="Suivi d'objet"
    SuiviObjet = 1,
    //% block="Reconnaissance d'objet"
    ReconnaissanceObjet = 2,
    //% block="Suivi de ligne"
    SuiviLigne = 3,
    //% block="Reconnaissance de couleur"
    Couleur = 4,
    //% block="Reconnaissance de tags"
    Tags = 5
}

enum PositionEcranPSO {
    //% block="gauche"
    Gauche = 0,
    //% block="centre"
    Centre = 1,
    //% block="droite"
    Droite = 2
}

enum DistanceObjetPSO {
    //% block="loin"
    Loin = 0,
    //% block="proche"
    Proche = 1,
    //% block="très proche"
    TresProche = 2
}

//% weight=100 color=#ff6600 icon="\uf03e" block="Caméra PSO"
namespace camera_PSO {

    const SCREEN_WIDTH = 320

    //% block="initialiser la caméra"
    //% weight=100
    export function initialiserCamera(): void {
        huskylens.initI2c()
        basic.pause(200)
    }

    //% block="mettre la caméra en mode %mode"
    //% weight=95
    export function changerMode(mode: CameraModePSO): void {

        switch (mode) {

            case CameraModePSO.Visage:
                huskylens.initMode(protocolAlgorithm.ALGORITHM_FACE_RECOGNITION)
                break

            case CameraModePSO.SuiviObjet:
                huskylens.initMode(protocolAlgorithm.ALGORITHM_OBJECT_TRACKING)
                break

            case CameraModePSO.ReconnaissanceObjet:
                huskylens.initMode(protocolAlgorithm.ALGORITHM_OBJECT_RECOGNITION)
                break

            case CameraModePSO.SuiviLigne:
                huskylens.initMode(protocolAlgorithm.ALGORITHM_LINE_TRACKING)
                break

            case CameraModePSO.Couleur:
                huskylens.initMode(protocolAlgorithm.ALGORITHM_COLOR_RECOGNITION)
                break

            case CameraModePSO.Tags:
                huskylens.initMode(protocolAlgorithm.ALGORITHM_TAG_RECOGNITION)
                break
        }

        basic.pause(300)
    }

    //% block="oublier les données IA"
    //% weight=90
    export function oublierDonnees(): void {
        huskylens.forgetLearn()
        basic.pause(300)
    }

    function actualiser(): void {
        huskylens.request()
    }

    //% block="position de la ligne IA"
    //% weight=85
    export function positionLigneIA(): PositionEcranPSO {

        actualiser()

        let x = huskylens.readArrow_s(Content4.xTarget)

        if (x < 0) {
            return PositionEcranPSO.Centre
        }

        if (x < 107) {
            return PositionEcranPSO.Gauche
        } else if (x < 214) {
            return PositionEcranPSO.Centre
        } else {
            return PositionEcranPSO.Droite
        }
    }

    //% block="la ligne IA est à %position"
    //% weight=84
    export function ligneEstA(position: PositionEcranPSO): boolean {
        return positionLigneIA() == position
    }

    //% block="position de l'objet IA"
    //% weight=80
    export function positionObjetIA(): PositionEcranPSO {

        actualiser()

        let x = huskylens.readBox_s(Content3.xCenter)

        if (x < 0) {
            return PositionEcranPSO.Centre
        }

        if (x < 107) {
            return PositionEcranPSO.Gauche
        } else if (x < 214) {
            return PositionEcranPSO.Centre
        } else {
            return PositionEcranPSO.Droite
        }
    }

    //% block="l'objet IA est à %position"
    //% weight=79
    export function objetEstA(position: PositionEcranPSO): boolean {
        return positionObjetIA() == position
    }

    //% block="distance de l'objet IA"
    //% weight=75
    export function distanceObjetIA(): DistanceObjetPSO {

        actualiser()

        let largeur = huskylens.readBox_s(Content3.width)

        if (largeur < 0) {
            return DistanceObjetPSO.Loin
        }

        if (largeur < 60) {
            return DistanceObjetPSO.Loin
        } else if (largeur < 120) {
            return DistanceObjetPSO.Proche
        } else {
            return DistanceObjetPSO.TresProche
        }
    }

    //% block="l'objet IA est %distance"
    //% weight=74
    export function objetEstDistance(distance: DistanceObjetPSO): boolean {
        return distanceObjetIA() == distance
    }

    // --------------------------------------------------------------------
    // BLOCS AVANCÉS HUSKYLENS EN FRANÇAIS
    // --------------------------------------------------------------------

    //% block="nombre d'objets détectés"
    //% weight=60
    export function nombreObjets(): number {

        actualiser()

        return huskylens.getBox(HUSKYLENSResultType_t.HUSKYLENSResultBlock)
    }

    //% block="nombre de lignes détectées"
    //% weight=59
    export function nombreLignes(): number {

        actualiser()

        return huskylens.getBox(HUSKYLENSResultType_t.HUSKYLENSResultArrow)
    }

    //% block="objet détecté"
    //% weight=58
    export function objetDetecte(): boolean {

        actualiser()

        return huskylens.isAppear_s(
            HUSKYLENSResultType_t.HUSKYLENSResultBlock
        )
    }

    //% block="ligne détectée"
    //% weight=57
    export function ligneDetectee(): boolean {

        actualiser()

        return huskylens.isAppear_s(
            HUSKYLENSResultType_t.HUSKYLENSResultArrow
        )
    }

    //% block="largeur de l'objet IA"
    //% weight=56
    export function largeurObjet(): number {

        actualiser()

        return huskylens.readBox_s(Content3.width)
    }

    //% block="hauteur de l'objet IA"
    //% weight=55
    export function hauteurObjet(): number {

        actualiser()

        return huskylens.readBox_s(Content3.height)
    }

    //% block="position X de l'objet IA"
    //% weight=54
    export function positionXObjet(): number {

        actualiser()

        return huskylens.readBox_s(Content3.xCenter)
    }

    //% block="position Y de l'objet IA"
    //% weight=53
    export function positionYObjet(): number {

        actualiser()

        return huskylens.readBox_s(Content3.yCenter)
    }

    //% block="position X de la ligne IA"
    //% weight=52
    export function positionXLigne(): number {

        actualiser()

        return huskylens.readArrow_s(Content4.xTarget)
    }

    //% block="position Y de la ligne IA"
    //% weight=51
    export function positionYLigne(): number {

        actualiser()

        return huskylens.readArrow_s(Content4.yTarget)
    }
}