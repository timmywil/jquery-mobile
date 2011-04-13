# The system generated date in YYYYMMDD format
DATE = $(shell date "+%Y%m%d")

# The version according to the source file. If this is the nightly build, use a different version
VER = $(shell cat version.txt)
nightly: VER = nightly

# The command to replace the @VERSION in the files with the actual version
SED_VER = sed "s/@VERSION/${VER}/"
nightly: SED_VER = sed "s/@VERSION/Nightly-${DATE}/"

# The version of jQuery core used
JQUERY = 1.5.2

# The directory to create the zipped files in and also serves as the filenames
DIR = jquery.mobile-${VER}

# The output folder for the finished files
OUTPUT = compiled

# The output folder for the nightly files.
NIGHTLY_OUTPUT = nightlies/${DATE}
NIGHTLY_WEBPATH = http://code.jquery.com/mobile/${NIGHTLY_OUTPUT}

# The filenames
JS = ${DIR}.js
MIN = ${DIR}.min.js
CSS = ${DIR}.css
CSSMIN = ${DIR}.min.css

# The files to include when compiling the JS files
JSFILES = 	  js/jquery.ui.widget.js \
			  js/jquery.mobile.widget.js \
			  js/jquery.mobile.media.js \
			  js/jquery.mobile.support.js \
			  js/jquery.mobile.vmouse.js \
			  js/jquery.mobile.event.js \
			  js/jquery.mobile.hashchange.js \
			  js/jquery.mobile.page.js \
			  js/jquery.mobile.core.js \
			  js/jquery.mobile.navigation.js \
			  js/jquery.mobile.fixHeaderFooter.js \
			  js/jquery.mobile.forms.checkboxradio.js \
			  js/jquery.mobile.forms.textinput.js \
			  js/jquery.mobile.forms.select.js \
			  js/jquery.mobile.buttonMarkup.js \
			  js/jquery.mobile.forms.button.js \
			  js/jquery.mobile.forms.slider.js \
			  js/jquery.mobile.collapsible.js \
			  js/jquery.mobile.controlGroup.js \
			  js/jquery.mobile.fieldContain.js \
			  js/jquery.mobile.listview.js \
			  js/jquery.mobile.listview.filter.js \
			  js/jquery.mobile.dialog.js \
			  js/jquery.mobile.navbar.js \
			  js/jquery.mobile.grid.js \
			  js/jquery.mobile.init.js

# The files to include when compiling the CSS files
CSSFILES =    themes/default/jquery.mobile.theme.css \
			  themes/default/jquery.mobile.core.css \
			  themes/default/jquery.mobile.transitions.css \
			  themes/default/jquery.mobile.grids.css \
			  themes/default/jquery.mobile.headerfooter.css \
			  themes/default/jquery.mobile.navbar.css \
			  themes/default/jquery.mobile.button.css \
			  themes/default/jquery.mobile.collapsible.css \
			  themes/default/jquery.mobile.controlgroup.css \
			  themes/default/jquery.mobile.dialog.css \
			  themes/default/jquery.mobile.forms.checkboxradio.css \
			  themes/default/jquery.mobile.forms.fieldcontain.css \
			  themes/default/jquery.mobile.forms.select.css \
			  themes/default/jquery.mobile.forms.textinput.css \
			  themes/default/jquery.mobile.listview.css \
			  themes/default/jquery.mobile.forms.slider.css

# By default, this is what get runs when make is called without any arguments.
# Min and un-min CSS and JS files are the only things built
all: init js min css cssmin notify

# Build the normal CSS file.
css: init
	@@head -8 js/jquery.mobile.core.js | ${SED_VER} > ${OUTPUT}/${CSS}
	@@cat ${CSSFILES} >> ${OUTPUT}/${CSS}

# Build the minified CSS file
cssmin: init css
	@@head -8 js/jquery.mobile.core.js | ${SED_VER} > ${OUTPUT}/${CSSMIN}
	@@java -jar build/yuicompressor-2.4.4.jar --type css ${OUTPUT}/${CSS} >> ${OUTPUT}/${CSSMIN}

# Build the normal JS file
js: init
	@@head -8 js/jquery.mobile.core.js | ${SED_VER} > ${OUTPUT}/${JS}
	@@cat ${JSFILES} >> ${OUTPUT}/${JS}

# Build the minified JS file
min: init js
	@@head -8 js/jquery.mobile.core.js | ${SED_VER} > ${OUTPUT}/${MIN}
	@@java -jar build/google-compiler-20100917.jar --js ${OUTPUT}/${JS} --warning_level QUIET --js_output_file ${MIN}.tmp
	@@cat ${MIN}.tmp >> ${OUTPUT}/${MIN}
	@@rm -f ${MIN}.tmp

# Let the user know the files were built and where they are
notify:
	@@echo "The files have been built and are in " $$(pwd)/${OUTPUT}

# Create the output directory. This is in a separate step so its not dependant on other targets
init:
	@@rm -rf ${OUTPUT}
	@@mkdir ${OUTPUT}

# Pull the latest commits. This is used for the nightly build but can be used to save some keystrokes
pull: 
	@@git pull --quiet

# Zip the 4 files and the theme images into one convenient package
zip: init js min css cssmin
	@@rm -rf ${DIR}
	@@mkdir -p ${DIR}
	@@cp ${OUTPUT}/${DIR}*.js ${DIR}/
	@@cp ${OUTPUT}/${DIR}*.css ${DIR}/
	@@cp -R themes/default/images ${DIR}/
	@@zip -rq ${OUTPUT}/${DIR}.zip ${DIR}
	@@rm -fr ${DIR}


# Used by the jQuery team to make the nightly builds
nightly: pull zip
	# Create a log that lists the current version according to the code and the git information for the last commit
	@@echo $$"\nGit Release Version: " >> ${OUTPUT}/log.txt
	@@cat version.txt >> ${OUTPUT}/log.txt
	@@echo $$"\nGit Information for this build:" >> ${OUTPUT}/log.txt
	@@git log -1 --format=format:"SHA1: %H %nDate: %cd %nTitle: %s" >> ${OUTPUT}/log.txt
	
	# Create the folder to hold the files for the demos
	@@mkdir -p ${VER}

	# Copy in the base stuff for the demos
	@@cp -r index.html themes experiments docs ${VER}/

	# First change all the paths from super deep to the same level for JS files
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|src="../../../js|src="js|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|src="../../js|src="js|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|src="../js|src="js|g' {} \;

	# Then change all the paths from super deep to the same level for CSS files
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|media="only all"||g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|rel="stylesheet"  href="../../../|rel="stylesheet"  href="|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|rel="stylesheet"  href="../../|rel="stylesheet"  href="|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|rel="stylesheet"  href="../|rel="stylesheet"  href="|g' {} \;

	# Change the empty paths to the location of this nightly file
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|href="themes/default/"|href="${NIGHTLY_WEBPATH}/${DIR}.min.css"|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|src="js/jquery.js"|src="http://code.jquery.com/jquery-${JQUERY}.min.js"|' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i 's|src="js/"|src="${NIGHTLY_WEBPATH}/${DIR}.min.js"|g' {} \;	

	# Move the demos into the output folder
	@@mv ${VER} ${OUTPUT}/demos

	# Copy the images as well
	@@cp -R themes/default/images ${OUTPUT}

	# Move the output folder to the nightlies folder
	@@scp -r ${OUTPUT} jqadmin@code.origin.jquery.com:/var/www/html/code.jquery.com/mobile/${NIGHTLY_OUTPUT}
	@@rm -rf ${OUTPUT}


# Used by the jQuery team to deploy a build to the CDN
deploy: zip
	# Deploy to CDN
	@@mv ${DIR} ${VER}
	@@cp ${DIR}.zip ${VER}/
	@@scp -r ${VER} jqadmin@code.origin.jquery.com:/var/www/html/code.jquery.com/mobile/
	@@mv ${VER} ${DIR}

	# Deploy Demos
	@@mkdir -p ${VER}
	@@cp -r index.html themes experiments docs ${VER}/

	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="../../../js|src="js|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="../../js|src="js|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="../js|src="js|g' {} \;

	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|media="only all"||g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|rel="stylesheet"  href="../../../|rel="stylesheet"  href="|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|rel="stylesheet"  href="../../|rel="stylesheet"  href="|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|rel="stylesheet"  href="../|rel="stylesheet"  href="|g' {} \;

	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|href="themes/default/"|href="http://code.jquery.com/mobile/${VER}/${DIR}.min.css"|g' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="js/jquery.js"|src="http://code.jquery.com/jquery-${JQUERY}.min.js"|' {} \;
	@@find ${VER} -type f -name '*.html' -exec sed -i "" -e 's|src="js/"|src="http://code.jquery.com/mobile/${VER}/${DIR}.min.js"|g' {} \;

	@@scp -r ${VER} jqadmin@jquerymobile.com:/srv/jquerymobile.com/htdocs/demos/
