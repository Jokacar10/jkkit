import { AssetType } from "./AssetType";
import { TokenImage } from "./TokenImage";
import { TokenAnimation } from "./TokenAnimation";

export interface TokenInfo {
    /** 
     * Name of the token 
     * */
    name?: string;

    /** 
     * Description of the token 
     */
    description?: string;

    /** 
     * Image associated with the token 
     */
    image?: TokenImage;

    /** 
     * Animation associated with the token 
     */
    animation?: TokenAnimation;

    /** 
     * Symbol of the token 
     */
    symbol?: string;

    /** 
     * Indicates if the token info is valid 
     */
    isValid?: boolean;
}