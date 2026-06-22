// =====================================================
//  PSO_Maqueen_sensors — librairie débutants
//  Capteurs ultrason et ligne pour le Maqueen Plus
// =====================================================

// Comparaison pour la condition de distance
export enum Comparaison {
    //% block="est inférieure à"
    Inferieur,
    //% block="est égale à"
    Egal,
    //% block="est supérieure à"
    Superieur
}

// Sélection du capteur de ligne
export enum CapteurLigne {
    //% block="L2 (extrême gauche)"
    L2,
    //% block="L1 (gauche)"
    L1,
    //% block="M (milieu)"
    M,
    //% block="R1 (droite)"
    R1,
    //% block="R2 (extrême droite)"
    R2
}

// Couleur détectée par un capteur de ligne
export enum CouleurSol {
    //% block="noir"
    Noir = 1,
    //% block="blanc"
    Blanc = 0
}

/**
 * Capteurs du robot Maqueen Plus
 */
//% weight=90 color=#9B59B6 icon="\uf06e" block="Capteurs Maqueen"
namespace PSO_Maqueen_sensors {

    // --- Constantes internes ---
    const I2C_ADDR          = 0x10;
    const LINE_STATE_REG    = 0x1D;
    const ADC_L2_REG        = 0x26;   // SensorL2
    const ADC_L1_REG        = 0x24;   // SensorL1
    const ADC_M_REG         = 0x22;   // SensorM
    const ADC_R1_REG        = 0x20;   // SensorR1
    const ADC_R2_REG        = 0x1E;   // SensorR2

    // Délai microsecondes pour le TRIG ultrason
    function delayUs(us: number): void {
        let i: number;
        while ((--us) > 0) {
            for (i = 0; i < 1; i++) { }
        }
    }

    // Lecture brute ultrason en cm (même algo que le code d'origine)
    function lireUltrasonCm(trig: DigitalPin, echo: DigitalPin): number {
        pins.digitalWritePin(trig, 1);
        delayUs(10);
        pins.digitalWritePin(trig, 0);
        let data = pins.pulseIn(echo, PulseValue.High, 1000 * 58);
        if (data == 0) {
            pins.digitalWritePin(trig, 1);
            delayUs(10);
            pins.digitalWritePin(trig, 0);
            data = pins.pulseIn(echo, PulseValue.High, 1000 * 58);
        }
        data = data / 59.259;
        if (data <= 0) return 0;
        if (data > 300) return 300;
        return Math.round(data);
    }

    // Lecture brute d'un capteur de ligne (état 0 ou 1)
    function lireEtatLigne(capteur: CapteurLigne): number {
        pins.i2cWriteNumber(I2C_ADDR, LINE_STATE_REG, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(I2C_ADDR, NumberFormat.Int8LE);
        switch (capteur) {
            case CapteurLigne.L2: return (data & 0x10) == 0x10 ? 1 : 0;
            case CapteurLigne.L1: return (data & 0x08) == 0x08 ? 1 : 0;
            case CapteurLigne.M:  return (data & 0x04) == 0x04 ? 1 : 0;
            case CapteurLigne.R1: return (data & 0x02) == 0x02 ? 1 : 0;
            default:              return (data & 0x01) == 0x01 ? 1 : 0;
        }
    }

    // =========================================================
    //  BLOCS ULTRASON
    // =========================================================

    /**
     * Donne la distance mesurée par le capteur ultrason en cm
     * @param trig Pin TRIG du capteur, eg: DigitalPin.P13
     * @param echo Pin ECHO du capteur, eg: DigitalPin.P14
     */
    //% block="distance ultrason (TRIG %trig ECHO %echo) en cm"
    //% trig.defl=DigitalPin.P13
    //% echo.defl=DigitalPin.P14
    //% weight=100
    export function distanceUltrason(trig: DigitalPin, echo: DigitalPin): number {
        return lireUltrasonCm(trig, echo);
    }

    /**
     * Vrai si la distance ultrason vérifie la condition choisie
     * @param trig       Pin TRIG du capteur, eg: DigitalPin.P13
     * @param echo       Pin ECHO du capteur, eg: DigitalPin.P14
     * @param condition  Comparaison à effectuer, eg: Comparaison.Inferieur
     * @param valeur     Distance de référence en cm, eg: 20
     */
    //% block="la distance ultrason (TRIG %trig ECHO %echo) %condition %valeur cm"
    //% trig.defl=DigitalPin.P13
    //% echo.defl=DigitalPin.P14
    //% valeur.min=0 valeur.max=300
    //% weight=90
    export function conditionUltrason(trig: DigitalPin, echo: DigitalPin, condition: Comparaison, valeur: number): boolean {
        let dist = lireUltrasonCm(trig, echo);
        if (condition == Comparaison.Inferieur) return dist < valeur;
        if (condition == Comparaison.Egal)      return dist == valeur;
        return dist > valeur;
    }

    // =========================================================
    //  BLOCS CAPTEURS DE LIGNE
    // =========================================================

    /**
     * Donne la couleur détectée par un capteur de ligne (noir ou blanc)
     * @param capteur Capteur de ligne à lire, eg: CapteurLigne.M
     */
    //% block="couleur vue par le capteur %capteur"
    //% weight=80
    export function couleurCapteur(capteur: CapteurLigne): CouleurSol {
        return lireEtatLigne(capteur) == 1 ? CouleurSol.Noir : CouleurSol.Blanc;
    }

    /**
     * Vrai si le capteur de ligne détecte la couleur choisie
     * @param capteur Capteur de ligne à tester, eg: CapteurLigne.M
     * @param couleur Couleur à détecter, eg: CouleurSol.Noir
     */
    //% block="le capteur %capteur voit du %couleur"
    //% weight=70
    export function conditionCapteurLigne(capteur: CapteurLigne, couleur: CouleurSol): boolean {
        let etat = lireEtatLigne(capteur);
        if (couleur == CouleurSol.Noir) return etat == 1;
        return etat == 0;
    }
}