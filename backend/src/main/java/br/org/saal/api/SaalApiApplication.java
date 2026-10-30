package br.org.saal.api;

import br.org.saal.api.auth.AdminPasswordHashGenerator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SaalApiApplication {
    public static void main(String[] args) {
        if (args.length == 1 && "--generate-admin-password-hash".equals(args[0])) {
            AdminPasswordHashGenerator.writeHashToConsole();
            return;
        }

        SpringApplication.run(SaalApiApplication.class, args);
    }
}
