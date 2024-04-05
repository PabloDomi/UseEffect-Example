// To parse this data:
//
//   import { Convert } from "./file";
//
//   const welcome = Convert.toWelcome(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Monument {
    id:                 number;
    idBienCultural:     number | null;
    nombre:             string;
    descripcion:        string;
    hasImage:           boolean;
    calle:              null | string;
    codigoPostal:       null | string;
    localidad:          string;
    municipio:          string;
    provincia:          Provincia;
    localizacion:       Localizacion;
    tipoMonumento:      string;
    tiposConstruccion:  string[];
    clasificacion:      Clasificacion | null;
    periodosHistoricos: PeriodosHistorico[];
}

export enum Clasificacion {
    ArquitecturaCivil = "Arquitectura Civil",
    ArquitecturaPopular = "Arquitectura Popular",
    ArquitecturaReligiosa = "Arquitectura Religiosa",
    JardínHistórico = "Jardín Histórico",
    ParajePintoresco = "Paraje Pintoresco",
    Yacimiento = "Yacimiento",
}

export interface Localizacion {
    latitud:  number;
    longitud: number;
}

export enum PeriodosHistorico {
    CeltaVetón = "Celta (Vetón)",
    EdadContemporánea = "Edad Contemporánea",
    EdadDelCobre = "Edad del Cobre",
    EdadDelHierro = "Edad del Hierro",
    EdadMedia = "Edad Media",
    EdadModerna = "Edad Moderna",
    Neolítico = "Neolítico",
    Paleolítico = "Paleolítico",
    Romano = "Romano",
}

export enum Provincia {
    Salamanca = "Salamanca",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toWelcome(json: string): Monument[] {
        return cast(JSON.parse(json), a(r("Welcome")));
    }

    public static welcomeToJson(value: Monument[]): string {
        return JSON.stringify(uncast(value, a(r("Welcome"))), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Welcome": o([
        { json: "id", js: "id", typ: 0 },
        { json: "idBienCultural", js: "idBienCultural", typ: u(0, null) },
        { json: "nombre", js: "nombre", typ: "" },
        { json: "descripcion", js: "descripcion", typ: "" },
        { json: "hasImage", js: "hasImage", typ: true },
        { json: "calle", js: "calle", typ: u(null, "") },
        { json: "codigoPostal", js: "codigoPostal", typ: u(null, "") },
        { json: "localidad", js: "localidad", typ: "" },
        { json: "municipio", js: "municipio", typ: "" },
        { json: "provincia", js: "provincia", typ: r("Provincia") },
        { json: "localizacion", js: "localizacion", typ: r("Localizacion") },
        { json: "tipoMonumento", js: "tipoMonumento", typ: "" },
        { json: "tiposConstruccion", js: "tiposConstruccion", typ: a("") },
        { json: "clasificacion", js: "clasificacion", typ: u(r("Clasificacion"), null) },
        { json: "periodosHistoricos", js: "periodosHistoricos", typ: a(r("PeriodosHistorico")) },
    ], false),
    "Localizacion": o([
        { json: "latitud", js: "latitud", typ: 3.14 },
        { json: "longitud", js: "longitud", typ: 3.14 },
    ], false),
    "Clasificacion": [
        "Arquitectura Civil",
        "Arquitectura Popular",
        "Arquitectura Religiosa",
        "Jardín Histórico",
        "Paraje Pintoresco",
        "Yacimiento",
    ],
    "PeriodosHistorico": [
        "Celta (Vetón)",
        "Edad Contemporánea",
        "Edad del Cobre",
        "Edad del Hierro",
        "Edad Media",
        "Edad Moderna",
        "Neolítico",
        "Paleolítico",
        "Romano",
    ],
    "Provincia": [
        "Salamanca",
    ],
};
