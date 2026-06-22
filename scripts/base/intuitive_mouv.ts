// =====================================================
//  PSO_Maqueen_movements — librairie débutants
//  Mouvements simples pour le robot Maqueen Plus
// =====================================================

// Sens de rotation du robot
export enum Direction {
    //% block="gauche"
    Gauche,
    //% block="droite"
    Droite,
}

// Niveaux de vitesse (1 = lent, 5 = rapide)
export enum Vitesse {
    //% block="1 (très lent)"
    TresLent  = 40,
    //% block="2 (lent)"
    Lent      = 80,
    //% block="3 (moyen)"
    Moyen     = 130,
    //% block="4 (rapide)"
    Rapide    = 180,
    //% block="5 (très rapide)"
    TresRapide = 230,
}

// Adresse I2C et registres moteurs (identiques au namespace d'origine)
const _I2C      = 0x10;
const _MOT_G    = 0x00;   // registre moteur gauche
const _MOT_D    = 0x02;   // registre moteur droit
const _AVANT    = 0;      // direction avant
const _ARRIERE  = 1;      // direction arrière

// -------------------------------------------------------
//  Fonction interne : envoie la commande aux deux moteurs
// -------------------------------------------------------
function _moteurs(dirG: number, vitG: number, dirD: number, vitD: number): void {
    let buf = pins.createBuffer(5);
    buf[0] = _MOT_G;
    buf[1] = dirG;
    buf[2] = vitG;
    buf[3] = dirD;
    buf[4] = vitD;
    pins.i2cWriteBuffer(_I2C, buf);
}

// -------------------------------------------------------
//  Fonction interne : arrête les deux moteurs
// -------------------------------------------------------
function _stop(): void {
    _moteurs(0, 0, 0, 0);
}

/**
 * Librairie de mouvements simples pour le Maqueen Plus
 */
//% weight=100 color=#FF6B35 icon="\uf1b9" block="Mouvements Maqueen"
namespace PSO_Maqueen_movements {

    /**
     * Le robot avance
     * @param vitesse Vitesse du robot, eg: Vitesse.Moyen
     */
    //% block="avancer à la vitesse %vitesse"
    //% weight=100
    export function avancer(vitesse: Vitesse): void {
        _moteurs(_AVANT, vitesse, _AVANT, vitesse);
    }

    /**
     * Le robot recule
     * @param vitesse Vitesse du robot, eg: Vitesse.Moyen
     */
    //% block="reculer à la vitesse %vitesse"
    //% weight=90
    export function reculer(vitesse: Vitesse): void {
        _moteurs(_ARRIERE, vitesse, _ARRIERE, vitesse);
    }

    /**
     * Le robot tourne sur place
     * @param sens    Sens de rotation (gauche ou droite), eg: Direction.Gauche
     * @param vitesse Vitesse du robot, eg: Vitesse.Moyen
     */
    //% block="tourner %sens à la vitesse %vitesse"
    //% weight=80
    export function tourner(sens: Direction, vitesse: Vitesse): void {
        if (sens == Direction.Gauche) {
            _moteurs(_ARRIERE, vitesse, _AVANT, vitesse);
        } else {
            _moteurs(_AVANT, vitesse, _ARRIERE, vitesse);
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
        _moteurs(_AVANT, vitesse, _AVANT, vitesse);
        basic.pause(secondes * 1000);
        _stop();
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
        _moteurs(_ARRIERE, vitesse, _ARRIERE, vitesse);
        basic.pause(secondes * 1000);
        _stop();
    }

    /**
     * Le robot tourne pendant un certain temps puis s'arrête
     * @param sens     Sens de rotation (gauche ou droite), eg: Direction.Gauche
     * @param vitesse  Vitesse du robot, eg: Vitesse.Moyen
     * @param secondes Durée en secondes, eg: 1
     */
    //% block="tourner %sens à la vitesse %vitesse pendant %secondes secondes"
    //% secondes.min=1 secondes.max=60
    //% weight=50
    export function tournerPendant(sens: Direction, vitesse: Vitesse, secondes: number): void {
        if (sens == Direction.Gauche) {
            _moteurs(_ARRIERE, vitesse, _AVANT, vitesse);
        } else {
            _moteurs(_AVANT, vitesse, _ARRIERE, vitesse);
        }
        basic.pause(secondes * 1000);
        _stop();
    }

    /**
     * Arrête le robot immédiatement
     */
    //% block="arrêter le robot"
    //% weight=40
    export function arreter(): void {
        _stop();
    }
}