// =====================================================
//  PSO_Maqueen_movements — librairie débutants
//  Mouvements simples pour le robot Maqueen Plus
// =====================================================


/**
 * Mouvements simples pour le robot Maqueen Plus
 */
//% weight=200 color=#FF6B35 icon="\uf1b9" block=" PSO Mouvements Maqueen"
namespace PSO_Maqueen_movements {
    export enum Direction {
    //% block="gauche"
    Gauche,
    //% block="droite"
    Droite
    };

    // Niveaux de vitesse (1 = lent, 5 = rapide)
    export enum Vitesse {
    //% block="1 - très lent"
    TresLent   = 40,
    //% block="2 - lent"
    Lent       = 80,
    //% block="3 - moyen"
    Moyen      = 130,
    //% block="4 - rapide"
    Rapide     = 180,
    //% block="5 - très rapide"
    TresRapide = 230
    };


    const I2C_ADDR     = 0x10;
    const REG_MOT_G    = 0x00;
    const REG_MOT_D    = 0x02;
    const DIR_AVANT    = 0;
    const DIR_ARRIERE  = 1;

    // Fonction interne : envoie une commande aux deux moteurs
    function moteurs(dirG: number, vitG: number, dirD: number, vitD: number): void {
        let buf = pins.createBuffer(5);
        buf[0] = REG_MOT_G;
        buf[1] = dirG;
        buf[2] = vitG;
        buf[3] = dirD;
        buf[4] = vitD;
        pins.i2cWriteBuffer(I2C_ADDR, buf);
    }

    // Fonction interne : arrête les deux moteurs
    function stopMoteurs(): void {
        moteurs(0, 0, 0, 0);
    }

    /**
     * Le robot avance
     * @param vitesse Vitesse du robot, eg: Vitesse.Moyen
     */
    //% block="avancer à la vitesse %vitesse"
    //% weight=100
    export function avancer(vitesse: Vitesse): void {
        moteurs(DIR_AVANT, vitesse, DIR_AVANT, vitesse);
    }

    /**
     * Le robot recule
     * @param vitesse Vitesse du robot, eg: Vitesse.Moyen
     */
    //% block="reculer à la vitesse %vitesse"
    //% weight=90
    export function reculer(vitesse: Vitesse): void {
        moteurs(DIR_ARRIERE, vitesse, DIR_ARRIERE, vitesse);
    }

    /**
     * Le robot tourne sur place
     * @param sens    Sens de rotation, eg: Direction.Gauche
     * @param vitesse Vitesse du robot, eg: Vitesse.Moyen
     */
    //% block="tourner %sens à la vitesse %vitesse"
    //% weight=80
    export function tourner(sens: Direction, vitesse: Vitesse): void {
        if (sens == Direction.Gauche) {
            moteurs(DIR_ARRIERE, vitesse, DIR_AVANT, vitesse);
        } else {
            moteurs(DIR_AVANT, vitesse, DIR_ARRIERE, vitesse);
        }
    }

    /**
     * Le robot avance pendant un certain temps puis s'arrête
     * @param vitesse  Vitesse du robot, eg: Vitesse.Moyen
     * @param secondes Durée en secondes, eg: 2
     */
    //% block="avancer à la vitesse %vitesse pendant %secondes secondes"
    //% secondes.min=1 secondes.max=60
    //% weight=70
    export function avancerPendant(vitesse: Vitesse, secondes: number): void {
        moteurs(DIR_AVANT, vitesse, DIR_AVANT, vitesse);
        basic.pause(secondes * 1000);
        stopMoteurs();
    }

    /**
     * Le robot recule pendant un certain temps puis s'arrête
     * @param vitesse  Vitesse du robot, eg: Vitesse.Moyen
     * @param secondes Durée en secondes, eg: 2
     */
    //% block="reculer à la vitesse %vitesse pendant %secondes secondes"
    //% secondes.min=1 secondes.max=60
    //% weight=60
    export function reculerPendant(vitesse: Vitesse, secondes: number): void {
        moteurs(DIR_ARRIERE, vitesse, DIR_ARRIERE, vitesse);
        basic.pause(secondes * 1000);
        stopMoteurs();
    }

    /**
     * Le robot tourne pendant un certain temps puis s'arrête
     * @param sens     Sens de rotation, eg: Direction.Gauche
     * @param vitesse  Vitesse du robot, eg: Vitesse.Moyen
     * @param secondes Durée en secondes, eg: 1
     */
    //% block="tourner %sens à la vitesse %vitesse pendant %secondes secondes"
    //% secondes.min=1 secondes.max=60
    //% weight=50
    export function tournerPendant(sens: Direction, vitesse: Vitesse, secondes: number): void {
        if (sens == Direction.Gauche) {
            moteurs(DIR_ARRIERE, vitesse, DIR_AVANT, vitesse);
        } else {
            moteurs(DIR_AVANT, vitesse, DIR_ARRIERE, vitesse);
        }
        basic.pause(secondes * 1000);
        stopMoteurs();
    }

    /**
     * Arrête le robot immédiatement
     */
    //% block="arrêter le robot"
    //% weight=40
    export function arreter(): void {
        stopMoteurs();
    }
}