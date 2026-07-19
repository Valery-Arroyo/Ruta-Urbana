<?php

use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;
class Logger implements LoggerInterface
{
    private $logpath;
    
   public function __construct() {
    // Definir la ruta absoluta evitando errores de sistema
    $this->logpath = "C:/xampp/htdocs/apirutaurbana/Log";
}

public function log($level, $message, array $context = []): void
{
    $dateF = (new \DateTime())->format('d-m-Y');
    $logfilename = $this->logpath . "/log-$dateF.log";
    
    $dateFormatted = (new \DateTime())->format('d-m-Y H:i:s');
    $user = "AppUser"; // Valor fijo, no uses shell_exec
    
    $message = sprintf("[%s] [%s] %s: %s%s", $dateFormatted, $user, $level, $message, PHP_EOL);
    
    // Solo intenta escribir si el directorio es escribible
    if (is_dir($this->logpath)) {
        @file_put_contents($logfilename, $message, FILE_APPEND);
    }
}
    public function emergency($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::EMERGENCY, $message, $context);
    }

    public function alert($message, array $context = []): void
    {
        $this->log(LogLevel::ALERT, $message, $context);
    }
    public function critical($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::CRITICAL, $message, $context);
    }
    public function warning($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::WARNING, $message, $context);
    }
    public function notice($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::NOTICE, $message, $context);
    }
    public function info($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::INFO, $message, $context);
    }
    public function debug($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::DEBUG, $message, $context);
    }
    public function error($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::ERROR, $message, $context);
    }
}
