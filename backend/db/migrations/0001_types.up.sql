CREATE TYPE difficulty_enum AS ENUM ('easy', 'medium', 'advanced');

CREATE TYPE report_type_enum AS ENUM (
    'Spam',
    'Inappropriate content',
    'Harassment or bullying',
    'False information',
    'Copyright violation',
    'Hate speech',
    'Sexually explicit content',
    'Violence or threats',
    'Other'
);

CREATE TYPE report_status_enum AS ENUM ('pending', 'approved', 'rejected');