import { ITransaction } from '@/js/ITransaction';
import { Asset } from '@/js/Asset';
import { ICollisionMap } from '@/js/IAsset';

export interface IRootState {
    assets: {
        [key: string]: Asset
    },
    assetsLoaded: boolean,
    assetAggregatesLoaded: boolean;
    chainId: string,
    recentTransactions: ITransaction[],
    known_addresses: {
        [key:string]: string
    },
    assetsSubsetForAggregations: {
        [key:string]: boolean
    },
    collisionMap: ICollisionMap
}
