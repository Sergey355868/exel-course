const path=require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const HtmlWebpackPlugin= require("html-webpack-plugin");
const CopyPlugin= require("copy-webpack-plugin");
const MiniCssExtractPlugin= require('mini-css-extract-plugin');
const webpack = require('webpack');

const isProd = process.env.NODE_ENV === "production";// true or false
const isDev = !isProd; // true or false
//console.log(isProd);
//console.log(isDev);
// в режиме разработки нам не важно какой hash у bundle.js и bundle.css,паттерн у них одинаковый
// поэтому напишем функцию
const filename = ext => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`;
//--------------------------------------------------------------------------------------------------------------
const jsLoader = () => {
	const loaders = [
		{
			loader: 'babel-loader',
			options: {
				presets: ['@babel/preset-env'],
				plugins: [
					'@babel/plugin-proposal-class-properties'
				]
			}
		},
	];
	if (isDev) {
		loaders.push('eslint-loader');
	}
	return loaders;
};
//-------------------------------------------------------------------------------------------------------------
module.exports = {
	context: path.resolve(__dirname, "src"), // __dirname системная переменная отвечающая за абсолютный путь до текущей папки exel-course и объеденяем со строчкой 'src'
	mode: "development",                     // по умолчанию если не указываем какие-то флаги webpack  в режиме разработки.
	entry: ["@babel/polyfill", "./index.js"], // основной файл с которого все начинается. Это объект , но если входной файл один может быть и строкой.К этому файлу подтягиваются все остальные
	output: {                               // обязательно объект
		//publicPath: '/',
		filename: filename("js"),        // Имя файла в котором будут находится все js файлы.Если продакшн мод файл bundle.js будет минифицированн(т.е когда запускаем npm run build).
		path: path.resolve(__dirname, "dist"), // (куда получим готовые файлы) все складывать будем в папку dist
		chunkFilename: '[id].js'
	},
	resolve: {
		extensions: [".js"], // при импортах можно не добавлять
		//import ../../../../../core/Component
		// когда пишем символ "@" то сразу переходим в папку src и от нее идем
		// import @core/Component
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@core":path.resolve(__dirname, "src/core")
		}
	},
	devtool: isDev ? 'source-map' : false, // добавляем map в режиме разработки
	devServer: {
		contentBase: path.resolve(__dirname, 'src/index.html'),
		//publicPath: '/',
		port:4200,
		watchOptions: {
			poll: true
		},
		compress:true,
		watchContentBase: true,
		hot: isDev,
		//historyApiFallback: true,
	},
	watch: true,
	// добавляем плагины ( в массиве)
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		}),
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			//filename: path.resolve(__dirname, 'dist/index.html?[hash]'),
			template: 'index.html',
			filename: 'index.html',
			minify: {
				removeComments:isProd,     // удаление коментариев в режиме прод, т.е. флаг true
				collapseWhitespace:isProd, // удаление пробелов в режиме прод, т.е. флаг true
			}
		}),
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: [
				path.resolve(__dirname, 'dist')
			]
		}),
		new CopyPlugin({
			patterns: [
				{
					// eslint-disable-next-line no-mixed-spaces-and-tabs
				  from: path.resolve(__dirname, 'src/favicon.ico'), // абсолютный путь поэтому указываем src несмотря на context:'src'. без src не будет работать
					// eslint-disable-next-line no-mixed-spaces-and-tabs
				  to:  path.resolve(__dirname, 'dist')
				}
			]
		}),
		new MiniCssExtractPlugin({
			filename: filename("css"),
			chunkFilename: '[id].css',
		}),

	],
	// добавляем лоадеры
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader, // затем через этот Loader
						options:{
							hmr:isDev,
							reloadAll:true,
						}
					},
					"css-loader", // затем через css-loader
					"sass-loader", // сначала пройдет через sass-loader
				],
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: jsLoader()

			},
			// {
			// 	test: /\.html$/i,
			// 	use: ['file-loader?name=[name].[ext]', 'extract-loader', 'html-loader'],
			// },
		],
	}
};
