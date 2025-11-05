<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MyActivity extends Model
{
    // ⬅️ ituro sa tamang table
    protected $table = 'my_activity_list';

    // kung walang created_at/updated_at columns
    public $timestamps = false;

    // (optional) kung primary key mo ay 'id'
    protected $primaryKey = 'id';

    protected $fillable = [
        'emp_id',
        'emp_name',
        'shift',
        'my_activity',
        'machine',
        'note',
        'status',
        'log_time',
        'time_out',
    ];

    protected $casts = [
        'log_time' => 'datetime',
        'time_out' => 'datetime',
    ];
}
