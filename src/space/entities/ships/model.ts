export interface Model {
  id :string;
  name :string;
  make :string;
  description: string;
}

export namespace Model {
  export const Warbird :Model = {
    id: 'warbird',
    name: 'HA-46',
    make: 'OConner Domanic',
    description: 'An agile, light fighter.'
  }

  export const Javelin :Model = {
    id: 'javelin',
    name: 'FC-12/0',
    make: 'Crummand',
    description: 'A multi-role, fast defensive fighter.'
  }

  export const Spider :Model = {
    id: 'spider',
    name: 'RSC17',
    make: 'Loakhaed',
    description: 'The leading edge in cloak technology.'
  }

  export const Leviathan :Model = {
    id: 'leviathan',
    name: 'Ut-59',
    make: 'Ivangrad',
    description: 'A powerful defense bomber.'
  }

  export const Terrier :Model = {
    id: 'terrier',
    name: 'Nu-34',
    make: 'Blight Aerospace',
    description: 'Heavily armed attack fighter.'
  }

  export const Weasel :Model = {
    id: 'weasel',
    name: 'ZnK/0-1',
    make: 'Yamakazi Sholi',
    description: 'Advanced weapons recon vessel.'
  }

  export const Lancaster :Model = {
    id: 'lancaster',
    name: '4F/2 HMS',
    make: 'Avro',
    description: 'Experimental bomber/fighter.'
  }

  export const Shark :Model = {
    id: 'shark',
    name: 'SY/9',
    make: 'Lezarwerks',
    description: 'Advanced cloakable fighter with Gravity Drive.'
  }
}
