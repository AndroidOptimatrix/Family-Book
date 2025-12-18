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
  subtitle: string;
  icon: ComponentType<any>;
  gradient: string;
  screen: string;
  icon_bg: string[];
};

export type Advertisement = {
  id: string;
  title: string;
  description: string;
  image: string;
  gradient: string[];
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