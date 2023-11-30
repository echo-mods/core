module.exports = {
	packagerConfig: {
		asar: true,
		ignore: [/node_modules$/, /src$/, /out$/]
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				name: 'EchoMods',
				authors: 'Andrei Hudalla',
				noMsi: true,
				description: 'A mod manager made with ❤️ for the stalker community',
			}
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
			s: ['darwin'],
		},
	],
};
