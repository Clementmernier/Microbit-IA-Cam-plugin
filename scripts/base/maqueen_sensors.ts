// =====================================================
//  PSO_Maqueen_sensors — librairie débutants
//  Capteurs ultrason et ligne pour le Maqueen Plus
// =====================================================

/**
 * Capteurs du robot Maqueen Plus
 */
//% weight=200 color=#9B59B6 icon="\uf06e" block="Capteurs"
namespace PSO_Maqueen_sensors {

    // --- Enums exportés (visibles dans les blocs) ---

    export enum Comparaison {
    //% block="est inférieure à"
    Inferieur,
    //% block="est égale à"
    Egal,
    //% block="est supérieure à"
    Superieur
    };

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
    };

    export enum CouleurSol {
    //% block="noir"
    Noir = 1,
    //% block="blanc"
    Blanc = 0
    };

    // --- Constantes internes ---
    const I2C_ADDR       = 0x10;
    const LINE_STATE_REG = 0x1D;

    // --- Fonctions internes ---

    export function delayUs(us: number): void {
        let i: number;
        while ((--us) > 0) {
            for (i = 0; i < 1; i++) { }
        }
    }

    export function lireUltrasonCm(trig: DigitalPin, echo: DigitalPin): number {
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

    export function lireEtatLigne(capteur: CapteurLigne): number {
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
     */
    //% block="distance ultrason en cm"
    //% weight=100
    export function distanceUltrason(): number {
        return lireUltrasonCm();
    }
 
    /**
     * Vrai si la distance ultrason vérifie la condition choisie
     * @param condition Comparaison à effectuer, eg: PSO_Maqueen_sensors.Comparaison.Inferieur
     * @param valeur    Distance de référence en cm, eg: 20
     */
    //% block="la distance ultrason %condition %valeur cm"
    //% valeur.min=0 valeur.max=300
    //% weight=90
    export function conditionUltrason(condition: Comparaison, valeur: number): boolean {
        let dist = lireUltrasonCm();
        if (condition == Comparaison.Inferieur) return dist < valeur;
        if (condition == Comparaison.Egal)      return dist == valeur;
        return dist > valeur;
    }


    // =========================================================
    //  BLOCS CAPTEURS DE LIGNE
    // =========================================================

    /**
     * Donne la couleur détectée par un capteur de ligne (noir ou blanc)
     * @param capteur Capteur de ligne à lire, eg: PSO_Maqueen_sensors.CapteurLigne.M
     */
    //% block="couleur vue par le capteur %capteur"
    //% weight=80
    export function couleurCapteur(capteur: CapteurLigne): CouleurSol {
        return lireEtatLigne(capteur) == 1 ? CouleurSol.Noir : CouleurSol.Blanc;
    }

    /**
     * Vrai si le capteur de ligne détecte la couleur choisie
     * @param capteur Capteur de ligne à tester, eg: PSO_Maqueen_sensors.CapteurLigne.M
     * @param couleur Couleur à détecter, eg: PSO_Maqueen_sensors.CouleurSol.Noir
     */
    //% block="le capteur %capteur voit du %couleur"
    //% weight=70
    export function conditionCapteurLigne(capteur: CapteurLigne, couleur: CouleurSol): boolean {
        let etat = lireEtatLigne(capteur);
        if (couleur == CouleurSol.Noir) return etat == 1;
        return etat == 0;
    }
}