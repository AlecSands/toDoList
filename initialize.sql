CREATE TABLE to_do_list (
    user_id serial PRIMARY KEY,
    description character varying(200) NOT NULL,
    location character varying(128) NOT NULL,
    task_complete character varying(2)
);

INSERT INTO "to_do_list" ("description", "location", "task_complete")
VALUES ('Wash the dishes', 'kitchen', 'n'),
	   ('Complete weekend assignment', 'home office', 'n');

/* CAN USE "is_complete BOOLEAN NOT NULL DEFAULT FALSE" to setup a boolean value
in the table */
