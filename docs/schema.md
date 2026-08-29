CREATE TABLE IF NOT EXISTS notes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    region_id VARCHAR(255) NULL DEFAULT 'GENERAL' UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT notes_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    note_id INT UNSIGNED NOT NULL,
    location_id VARCHAR(255) NULL,
    item_id VARCHAR(255) NULL,
    item_name VARCHAR(255) NOT NULL, # if item_id is NULL, this is a general line note
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT notes_items_note_id_foreign FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
    INDEX notes_items_note_id_index (note_id)
);