<?php

namespace App;

enum RunType: string
{
    case Pilgrim = 'PILGRIM';
    case Voyager = 'VOYAGER';
    case Stalker = 'STALKER';
    case Interloper = 'INTERLOPER';
    case Misery = 'MISERY';
    case Custom = 'CUSTOM';
}
