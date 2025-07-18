import { Component, ChangeDetectionStrategy } from '@angular/core';
import {Recipe} from "../../core/models/recipe.model";

@Component({
    selector: 'app-recipe',
    imports: [],
    templateUrl: './recipe.component.html',
    styleUrl: './recipe.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeComponent {
  recipe = new Recipe(1, "jajecznica", ["jajka", "chleb", "jajka", "chleb", "jajka", "chleb", "jajka", "chleb", "jajka", "chleb"], "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean scelerisque ullamcorper venenatis. Etiam scelerisque turpis ac mi dapibus tempor. Nunc ullamcorper tincidunt scelerisque. Vestibulum congue ex eget ligula aliquet ornare. Etiam commodo ligula eget urna sagittis, quis egestas justo consequat. Proin efficitur sem a tellus congue volutpat. In a tortor mattis, aliquam quam ut, accumsan diam.\n" +
    "\n" +
    "In ut bibendum dui, sit amet tempus massa. Proin placerat venenatis vehicula. Proin nec interdum nunc. In dui neque, tincidunt vel metus eu, porta volutpat ipsum. Etiam iaculis, orci ac efficitur scelerisque, lacus lacus tempor augue, at malesuada augue augue vitae purus. Integer vitae iaculis quam. Donec et arcu eleifend, lobortis dolor et, facilisis tortor. Maecenas ornare sapien eget massa mattis, lobortis euismod nulla porttitor. Morbi fermentum semper dapibus. Curabitur sed mi justo. Sed a erat volutpat, eleifend velit et, vestibulum felis. Donec bibendum ultricies consectetur. Nam rutrum, augue nec pulvinar ornare, tellus magna vulputate risus, quis convallis augue lorem in enim. Vivamus congue dui a erat lacinia consequat. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.\n" +
    "\n" +
    "In ultricies volutpat eros, ut ultricies velit feugiat id. Quisque interdum dignissim lorem, in blandit nisi ullamcorper sed. Pellentesque arcu enim, dapibus id ultrices ut, malesuada non justo. Vestibulum vitae elit rutrum, mattis sem vitae, convallis lacus. Quisque vel dapibus elit, gravida aliquam mi. Nulla et molestie lorem. In non metus id lorem tincidunt commodo. In blandit dictum consequat.");
}
