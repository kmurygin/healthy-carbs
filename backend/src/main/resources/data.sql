INSERT INTO users (id, email, firstname, lastname, password, role, username) VALUES
(nextval('users_seq'), 'kacpi@kacpi1.com', 'Kacper', 'Murygin',
'$2a$10$zvTPCv0VtpnrGfXTmneSx.5.y5idinoYRYskH2G.PH1vR6ercq3ce',
'USER', 'akcpi24'),
(nextval('users_seq'), 'kacpi@kacpi2.com', 'Kacper', 'Murygin',
 '$2a$10$zvTPCv0VtpnrGfXTmneSx.5.y5idinoYRYskH2G.PH1vR6ercq3ce',
 'USER', 'kacpi23'),
(nextval('users_seq'), 'kacpi@kacpi3.com', 'Kacper', 'Murygin',
    '$2a$10$zvTPCv0VtpnrGfXTmneSx.5.y5idinoYRYskH2G.PH1vR6ercq3ce',
    'USER', 'kacpi22');
