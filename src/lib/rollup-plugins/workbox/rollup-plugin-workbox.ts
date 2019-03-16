import colors from "colors";
import { OutputBundle, OutputOptions } from "rollup";
import {generateSW, injectManifest} from "workbox-build";

export type WorkboxConfig = any;

export enum GenerateServiceWorkerKind {
	generateSw = "generateSw",
	injectManifest = "injectManifest"
}

export interface IRollupPluginWorkboxConfig {
	mode: GenerateServiceWorkerKind;
	verbose: boolean;
	timeout: number;
	workboxConfig: WorkboxConfig;
}

/**
 * Default configuration for the workbox rollup plugin.
 */
const defaultConfig: IRollupPluginWorkboxConfig = {
	mode: GenerateServiceWorkerKind.generateSw,
	verbose: true,
	timeout: 2000,
	workboxConfig: {}
};

/**
 * Returns the correct method to for generating the Service Worker.
 * @param mode
 */
function workboxFactory (mode: GenerateServiceWorkerKind): typeof generateSW | typeof injectManifest {
	switch (mode) {
		case GenerateServiceWorkerKind.generateSw:
			return generateSW;
		case GenerateServiceWorkerKind.injectManifest:
			return injectManifest;
	}

	throw new Error(`[workbox] - The mode "${mode} is not valid"`);
}

/**
 * A Rollup plugin that uses workbox to generate a service worker.
 * @param config
 */
export function workbox (config: Partial<IRollupPluginWorkboxConfig> = {}) {
	const {workboxConfig, mode, verbose, timeout} = {...defaultConfig, ...config};

	// Ensure a workbox config exists
	if (workboxConfig == null) {
		throw new Error(`[workbox] - The workboxConfig needs to be defined`);
	}

	return {
		name: "workbox",
		generateBundle: async (outputOptions: OutputOptions, bundle: OutputBundle, isWrite: boolean): Promise<void> => {
			if (!isWrite) return;

			try {
				setTimeout(async () => {
					await workboxFactory(mode)(workboxConfig);
				}, timeout);
				await workboxFactory(mode)(workboxConfig);

			} catch (ex) {
				if (verbose) {
					console.log(colors.red(`[workbox] - The Service Worker could not be generated: "${ex.message}"`));
				}
			}
		}
	}
}

