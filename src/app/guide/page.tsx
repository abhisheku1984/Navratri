/**
 * "Ask the AI Guide" lives at /guide.
 *
 * The implementation is the Devi Gyan assistant, which already runs the
 * retrieval-first pipeline (search the verified corpus, rank passages, cite or
 * refuse). Re-exported here so the guide has a stable, memorable address, while
 * the older /devi-gyan URL keeps working for anyone who bookmarked it.
 */
export { default } from "../devi-gyan/page";
