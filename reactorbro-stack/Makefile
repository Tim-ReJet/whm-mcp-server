
.PHONY: bootstrap wp-init wp-plugins wp-graphql wp-acf wp-up wp-down astro-dev tokens ui

bootstrap:
	pnpm install
	turbo run build

wp-init:
	ddev stop || true
	ddev config --project-type=wordpress --docroot=apps/wp/public --create-docroot
	ddev start
	# Download and install WordPress (interactive prompts for db will be auto-provided by ddev env)
	ddev wp core download
	ddev wp config create --dbname=db --dbuser=db --dbpass=db --dbhost=db --skip-check
	ddev wp db create
	ddev wp core install --url=https://reactorjet.ddev.site --title="Headless CMS" --admin_user=admin --admin_password=admin --admin_email=admin@example.com
	ddev wp rewrite structure '/%postname%/'

wp-plugins:
	# Useful headless plugins
	ddev wp plugin install wp-graphql --activate
	ddev wp plugin install advanced-custom-fields --activate
	ddev wp plugin install https://github.com/wp-graphql/wpgraphql-acf/releases/latest/download/wpgraphql-acf.zip --activate
	ddev wp plugin install query-monitor --activate

wp-graphql:
	# Example GraphQL settings (optional)
	echo "WPGraphQL ready"

wp-acf:
	# Create ACF JSON sync dir
	mkdir -p apps/wp/public/wp-content/acf-json

wp-up:
	ddev start

wp-down:
	ddev stop

astro-dev:
	pnpm -C apps/astro dev

tokens:
	pnpm -C packages/tokens build
