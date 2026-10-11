/**
 * Ambient declarations for non-TS imports.
 *
 * Leaflet's stylesheet is imported as a side effect from inside a lazily loaded
 * component (see PeethaMap in components/interactive.tsx) so that neither the
 * library nor its CSS reaches the initial page bundle. Next handles the import
 * at build time; this declaration is only so `tsc` accepts it.
 */
declare module "*.css";
