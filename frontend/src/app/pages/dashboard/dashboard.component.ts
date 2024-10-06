import {Component, inject, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatDivider} from "@angular/material/divider";
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {UserComponent} from "../../user/user.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButton,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatToolbar,
    UserComponent,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent{}
