
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface Book {
    title?: Nullable<string>;
    author?: Nullable<string>;
}

export interface IQuery {
    books(): Nullable<Nullable<Book>[]> | Promise<Nullable<Nullable<Book>[]>>;
}

type Nullable<T> = T | null;
