// types.ts
import { ComponentType } from 'react';

export type MenuItem = {
  id: string;
  title: string;
  icon: ComponentType<any>;
  gradient: string;
  screen: string;
};

export type GridItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: ComponentType<any>;
  gradient: string;
  screen: string;
  icon_bg: string[];
};

export type Advertisement = {
  image: string;
  website: string;
  description: string;
  result: string;
  msg: string;
};

export type Platform = {
  id: string;
  name: string;
  icon: ComponentType<any>;
  handle: string;
  followers: string;
  url: string;
  gradient: string[];
};

export type Event = {
  id: string;
  title: string;
  date: string;
  type: 'birthday' | 'anniversary';
  icon: ComponentType<any>;
  gradient: string[];
};

export type BirthDayOrAnniversary = {
  id: string,
  full_name: string,
  name: string,
  dob: string,
  city: string,
  age: string,
  marriage_date: string,
  marriage_year: string,
  mobile: string,
  image: string,
  result: string,
  msg?: string
}