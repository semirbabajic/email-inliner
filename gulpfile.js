var gulp = require('gulp'),
	handlebars = require('handlebars'),
	premailer = require('premailer-api'),
	fs = require('fs');

console.log = function(msg) {
	process.stdout.write(msg + "\n");
};

gulp.task('templates', function() {
	var masterHtml = fs.readFileSync('./emails/sources/master.html', 'utf-8'),
		masterTpl = handlebars.compile(masterHtml),
		masterCompiled = "";

	fs.readdir('./emails/sources/pages', function(err, files) {
		if (err) {
			console.log(err);
			return;
		}

		// Filter only html files
		files
		.filter(function(file) {
			return file.substr(-5) === '.html'; 
		})
		.forEach(function(file) {
			fs.readFile("./emails/sources/pages/" + file, 'utf-8', function(err, contents) {
				if (err) {
					console.log(err);
					return;
				}

				console.log("STATUS: Running handlebars on '" + file + "' template...");

				masterCompiled = masterTpl({
					body: contents
				});

				console.log("STATUS: Running premailer on '" + file + "' template...");

				premailer.prepare({
					html: masterCompiled 
				}, function(err, email) {  
					fs.writeFile("./emails/compiled/" + file, email.html, 'utf-8', function(err) {
						if (err) {
							console.log("ERR: Failed to write '" + file + "' template!");
						} else {
							console.log("SUCCESS: Successfully compiled handlebars for '" + file + "' template!");
						}
					});
				});
			});
		});
	});
});

gulp.task('watch', function() {
	gulp.watch([
		'./emails/sources/*.html',
		'./emails/sources/pages/*.html',
	], ['templates']);	
});

gulp.task('default', ['templates', 'watch']);