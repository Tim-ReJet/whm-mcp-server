<?php
/**
 * Header Template
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="site-header">
    <div class="container">
        <div class="header-inner">
            <a href="<?php echo home_url(); ?>" class="site-logo">BERG PROJECTS</a>
            <nav class="main-navigation" aria-label="Main Navigation">
                <ul>
                    <li><a href="<?php echo home_url(); ?>">Home</a></li>
                    <li><a href="#services-section">Services</a></li>
                    <li><a href="#why-choose-section">Why Choose Us</a></li>
                    <li><a href="#testimonial-section">Testimonials</a></li>
                    <li><a href="#contact-section">Contact</a></li>
                </ul>
            </nav>
        </div>
    </div>
</header>
