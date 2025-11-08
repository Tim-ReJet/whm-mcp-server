<?php
/**
 * Register Custom Post Types for Berg Projects
 */

// Register Projects CPT
function berg_register_projects_cpt() {
    $labels = array(
        'name' => 'Projects',
        'singular_name' => 'Project',
        'add_new' => 'Add New Project',
        'add_new_item' => 'Add New Project',
        'edit_item' => 'Edit Project',
        'new_item' => 'New Project',
        'view_item' => 'View Project',
        'search_items' => 'Search Projects',
        'not_found' => 'No projects found',
        'not_found_in_trash' => 'No projects found in trash'
    );
    
    $args = array(
        'labels' => $labels,
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-building',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'project',
        'graphql_plural_name' => 'projects',
    );
    
    register_post_type('projects', $args);
}
add_action('init', 'berg_register_projects_cpt');

// Register Services CPT
function berg_register_services_cpt() {
    $labels = array(
        'name' => 'Services',
        'singular_name' => 'Service',
        'add_new' => 'Add New Service',
        'add_new_item' => 'Add New Service',
        'edit_item' => 'Edit Service',
        'new_item' => 'New Service',
        'view_item' => 'View Service',
        'search_items' => 'Search Services',
        'not_found' => 'No services found',
        'not_found_in_trash' => 'No services found in trash'
    );
    
    $args = array(
        'labels' => $labels,
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-admin-tools',
        'supports' => array('title', 'editor', 'thumbnail', 'page-attributes'),
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'service',
        'graphql_plural_name' => 'services',
    );
    
    register_post_type('services', $args);
}
add_action('init', 'berg_register_services_cpt');
