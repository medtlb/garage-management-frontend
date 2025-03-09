export interface Garage {
    id?: number;
    nom: string;
    latitude: number;
    longitude: number;
    telephone?: string;
    email?: string;
    capacite?: number;
    categorie?: 'VEHICULES_LEGERS' | 
                'VEHICULES_UTILITAIRES' | 
                'CAMIONS' | 
                'VEHICULES_ELECTRIQUES_HYBRIDES' | 
                'MOTOS_SCOOTERS' | 
                'ENGINS_AGRICOLES' | 
                'VEHICULES_CHANTIER';
}