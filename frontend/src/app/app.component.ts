import { Component, OnInit } from '@angular/core';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  ngOnInit() {
    if (!localStorage.getItem('creatorId')) {
      localStorage.setItem('creatorId', uuid());
    }
  }

}
