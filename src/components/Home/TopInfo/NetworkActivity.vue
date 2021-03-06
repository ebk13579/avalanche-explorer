<template>
    <div>
        <div class="header">
            <h2 class="meta_title">
                Avalanche Network Activity
                <TooltipHeading content="Key Avalanche stats"></TooltipHeading>
            </h2>
        </div>
        <section class="stats">
            <article class="meta">
                <router-link class="stat" to="/tx">
                    <p class="label">
                        24h Transactions
                        <TooltipMeta
                            content="Total number of state queries or modifications of all blockchains on Avalanche in the past 24 hours"
                        ></TooltipMeta>
                    </p>
                    <div v-if="assetsLoaded">
                        <p class="meta_val">
                            {{totalTransactions.toLocaleString()}}
                            <span class="unit">({{tpmText}} TPM)</span>
                        </p>
                    </div>
                    <div v-else>
                        <v-progress-circular :size="16" :width="2" color="#E84970" indeterminate key="1"></v-progress-circular>
                    </div>
                </router-link>
            </article>
            <article class="meta">
                <router-link class="stat" to="/assets">
                    <p class="label">
                        24h Volume
                        <TooltipMeta
                            content="Total value of AVAX transferred on Avalanche in the past 24 hours"
                        ></TooltipMeta>
                    </p>
                    <div v-if="assetsLoaded">
                        <p class="meta_val">
                            {{avaxVolume}}
                            <span class="unit">AVAX</span>
                        </p>
                        <!--<p class="change">+ 24%</p>-->
                    </div>
                    <div v-else>
                        <v-progress-circular :size="16" :width="2" color="#E84970" indeterminate key="1"></v-progress-circular>
                    </div>
                </router-link>
            </article>
            <article class="meta">
                <router-link class="stat" to="/validators">
                    <p class="label">
                        Validators
                        <TooltipMeta
                            content="Total number of nodes validating transactions on Avalanche"
                        ></TooltipMeta>
                    </p>
                    <div v-if="subnetsLoaded">
                        <p class="meta_val">{{validatorCount.toLocaleString()}}</p>
                        <!--<p class="change">+ 24%</p>-->
                    </div>
                    <div v-else>
                        <v-progress-circular :size="16" :width="2" color="#E84970" indeterminate key="1"></v-progress-circular>
                    </div>
                </router-link>
            </article>
            <article class="meta">
                <router-link class="stat" to="/validators">
                    <p class="label">
                        Total Staked
                        <TooltipMeta
                            content="Total value of AVAX locked to secure Avalanche"
                        ></TooltipMeta>
                    </p>
                    <div v-if="subnetsLoaded">
                        <p class="meta_val">
                            {{totalStake}}
                            <span class="unit">AVAX</span>
                        </p>
                    </div>
                    <div v-else>
                        <v-progress-circular :size="16" :width="2" color="#E84970" indeterminate key="1"></v-progress-circular>
                    </div>
                </router-link>
            </article>
            <article class="meta">
                <router-link class="stat" to="/blockchains">
                    <p class="label">
                        Blockchains
                        <TooltipMeta
                            content="Total number of blockchains on Avalanche"
                        ></TooltipMeta>
                    </p>
                    <div v-if="subnetsLoaded">
                        <p class="meta_val">
                            {{totalBlockchains}}
                        </p>
                    </div>
                    <div v-else>
                        <v-progress-circular :size="16" :width="2" color="#E84970" indeterminate key="1"></v-progress-circular>
                    </div>
                </router-link>
            </article>
            <article class="meta">
                <router-link class="stat" to="/subnets">
                    <p class="label">
                        Subnets
                        <TooltipMeta
                            content="Total number of subnets on Avalanche"
                        ></TooltipMeta>
                    </p>
                    <div v-if="subnetsLoaded">
                        <p class="meta_val">
                            {{totalSubnets}}
                        </p>
                    </div>
                    <div v-else>
                        <v-progress-circular :size="16" :width="2" color="#E84970" indeterminate key="1"></v-progress-circular>
                    </div>
                </router-link>
            </article>
        </section>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Watch } from "vue-property-decorator";

import axios from "@/axios";
import { stringToBig } from "@/helper";
import TooltipHeading from "../../misc/TooltipHeading.vue";
import TooltipMeta from "../TopInfo/TooltipMeta.vue";
import { AVAX_ID } from "@/store/index";
import { Asset } from '@/js/Asset';
import Big from "big.js";

@Component({
    components: {
        TooltipHeading,
        TooltipMeta
    }
})
export default class NetworkActivity extends Vue {
    volumeCache: Big = Big(0);
    totalTransactionsCache: number = 0;

    get assetsLoaded(): boolean {
        return this.$store.state.assetsLoaded;
    }

    get assetAggregatesLoaded(): boolean {
        return this.$store.state.assetAggregatesLoaded;
    }

    get subnetsLoaded(): boolean {
        return this.$store.state.Platform.subnetsLoaded;
    }

    @Watch("avaxVolume")
    onAvaxVolumeChanged(val: string) {
        this.saveCacheAvax();
    }

    @Watch("totalTransactions")
    ontotalTransactionsChanged(val: number) {
        this.saveCacheTotalTransactions();
    }

    created() {
        // Get 24h volume cache
        // TODO: remove when API is enhanced
        let volumeCacheJSON = localStorage.getItem('avaxCache');
        let volumeCache = Big(0);
        if (volumeCacheJSON) {
            let cache =  JSON.parse(volumeCacheJSON);
            volumeCache = Big(cache.volume_day);
        }
        this.volumeCache = volumeCache;

        // Get totalTransactions cache 
        // TODO: remove when API is enhanced
        let totalTransactionsCacheJSON = localStorage.getItem('totalTransactions');
        let totalTransactionsCache = 0;
        if (totalTransactionsCacheJSON) {
            let cache = JSON.parse(totalTransactionsCacheJSON);
            totalTransactionsCache = cache;
        }
        this.totalTransactionsCache = totalTransactionsCache;
    }

    saveCacheAvax() {
        let asset = this.avax;
        if (asset) {
            let volume_day = asset.volume_day.toString();
            let txCount_day = asset.txCount_day;
            let cache = {
                volume_day,     // AVAX volume
                txCount_day,    // AVAX count
            };
            localStorage.setItem('avaxCache', JSON.stringify(cache)); 
        }
    }

    saveCacheTotalTransactions() {
        let totalTransactions = this.totalTransactions;
        let cache = {
            totalTransactions   // count across all assets
        }
        localStorage.setItem('totalTransactions', JSON.stringify(totalTransactions));
    }

    // Data from Ortelius
    get tpmText(): string {
        let day = 60 * 24;
        let avg = this.totalTransactions / day;
        return avg > 1 ? avg.toFixed(0) : avg.toFixed(2);
    }

    get tpsText(): string {
        let day = 60 * 60 * 24;
        let avg = this.totalTransactions / day;
        return avg > 1 ? avg.toFixed(0) : avg.toFixed(2);
    }

    get assets() {
        return this.$store.state.assets;
    }

    get avax(): Asset | undefined { 
        return this.assets[AVAX_ID];
    }
    
    get avaxVolume(): string {
        if (!this.avax) {
            return parseInt(this.volumeCache.toFixed(0)).toLocaleString();
        }
        return this.avax.isHistoryUpdated 
            ? parseInt(this.avax.volume_day.toFixed(0)).toLocaleString()
            : parseInt(this.volumeCache.toFixed(0)).toLocaleString();
    }

    get totalTransactions(): number {
        return this.$store.state.assetAggregatesLoaded
            ? this.$store.getters.totalTransactions
            : this.totalTransactionsCache;
    }
        
    // Data from Avalanche-Go
    get totalStake(): string {
        let res = this.$store.getters["Platform/totalStake"];
        res = stringToBig(res.toString(), 9).toFixed(0);
        return parseInt(res).toLocaleString();
    }

    get validatorCount(): number {
        return this.$store.getters["Platform/totalValidators"];
    }

    get totalBlockchains(): number {
        return this.$store.getters["Platform/totalBlockchains"];
    }
    
    get totalSubnets(): number {
        return Object.keys(this.$store.state.Platform.subnets).length;
    }
}

</script>
<style scoped lang="scss">
@use "../../../main";

.header {
    padding-bottom: 20px;
}

.stats {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    row-gap: 30px;
    column-gap: 30px;
    padding: 4px 0 0;
    flex-wrap: wrap;
    overflow: auto;

    /* hyperlink */
    .meta {
        font-size: 12px;
        display: flex;
        flex-grow: 1;
        justify-content: flex-start;
        flex-wrap: wrap;
        font-weight: 700;
        
        .stat {
            &:hover {
                text-decoration: none !important;
                opacity: 0.7;
            }
        }
        
        .stat > div {
            display: flex;
        }

        p {
            padding: 2px 4px;
            font-weight: 400; /* 700 */
        }

        .label {
            text-transform: capitalize;
            color: main.$primary-color;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .meta_val {
            font-size: 18px;
            line-height: 1em;

            .unit {
                font-size: 12px;
                opacity: 0.7;
            }
        }

        .change {
            background-color: main.$green-light;
            color: main.$green !important;
            padding: 2px 4px;
            border-radius: 2px;
            flex-grow: 0 !important;
        }
    }
}

@include main.device_m {
    .stats {
        img {
            width: 24px;
        }
    }
}

@include main.device_s {
    .stats {
        grid-template-columns: 50% 50%;
        grid-template-rows: max-content;

        > div {
            padding: 30px 0 0;
        }
    }
}

@include main.device_xs {
    .stats {
        grid-template-columns: none;

        img {
            display: none;
        }

        .stat {
            .label {
                font-size: 13px;
            }

            .meta_val {
                font-size: 20px;

                .unit {
                    font-size: 14px;
                }
            }
        }
    }
}
</style>
